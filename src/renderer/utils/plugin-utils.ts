import type {
  InstalledToolkitPlugin,
  PluginTestOptions,
  ToolkitPlugin,
  ToolkitPluginWithNpmInfo,
} from '@/shared/types/toolkit-plugin'
import { eventBus } from '@/renderer/utils/event-bus.js'
import { useAppInstalledPlugins } from '@/renderer/stores/installed-plugins'
import { appEnv } from '@ybgnb/vite-env/common'
import { toolkitApi } from '@/renderer/api/toolkit-api.js'
import { parseNpmSearchResultPkg } from '@/shared/utils/plugin-parse.js'
import { toIPC } from 'bilitoolkit-runtime'
import { getFormattedDate } from '@ybgnb/utils'
import { searchPackages, type NpmSearchResultItem, SearchText } from 'public-registry-api'
import { usePluginUpdates } from '@/renderer/stores/plugin-updates'
import { matchesPluginSearch } from '@/shared/utils/plugin-search'
import { useRecommendedPlugins } from '@/renderer/stores/recommended-plugins'
import type { PageResult } from 'bilitoolkit-ui'
import { useRecentPluginsStore } from '@/renderer/stores/recent-plugins'
import { useStarredPluginsStore } from '@/renderer/stores/starred-plugins'
import { AppError } from 'bilitoolkit-types'

export class PluginUtils {
  static async openPluginView(plugin: InstalledToolkitPlugin) {
    useRecentPluginsStore().addRecent(plugin.id)
    eventBus.emit('openPluginView', { plugin: plugin })
  }

  static async closePluginView(plugin: InstalledToolkitPlugin) {
    if (plugin.type === 'ui') await toolkitApi.core.closePlugin(toIPC(plugin))
    eventBus.emit('closePluginView', { plugin: plugin })
  }

  static async hideCurrPluginView() {
    eventBus.emit('hideCurrPluginView')
  }

  static async loadTestPlugin(options: PluginTestOptions) {
    const plugin = await toolkitApi.core.loadTestPlugin(options)
    useAppInstalledPlugins().addPlugin(plugin)
    eventBus.emit('openPluginView', { plugin: plugin })
    return plugin
  }

  private static isSameAuthor(npmPackage: NpmSearchResultItem) {
    return npmPackage.package.publisher.username === appEnv.APP_AUTHOR
  }

  /**
   * 排序npm上的插件（推荐插件>同作者>其他）
   * @param plugins
   */
  static async sortNpmPlugins(plugins: NpmSearchResultItem[]): Promise<NpmSearchResultItem[]> {
    // 获取推荐的插件
    const recommendedPlugins = useRecommendedPlugins().plugins
    // 排序 map
    const orderMap = new Map<string, number>()
    // 按照顺序设置从小到大的负值
    recommendedPlugins.forEach((recommended, index) => {
      orderMap.set(recommended.id, index - recommendedPlugins.length)
    })

    return [...plugins].sort((a, b) => {
      const indexA = orderMap.get(a.package.name) ?? (this.isSameAuthor(a) ? 0 : a.downloads.monthly)
      const indexB = orderMap.get(b.package.name) ?? (this.isSameAuthor(b) ? 0 : b.downloads.monthly)

      return indexA - indexB
    })
  }

  static async searchNpmPlugins({
    pageNum = 1,
    pageSize = 20,
    showThirdPartyPlugins = false,
    blockedPluginIds = [],
    name,
  }: {
    pageNum?: number
    pageSize?: number
    blockedPluginIds?: string[]
    showThirdPartyPlugins?: boolean
    name?: string
  }): Promise<PageResult<ToolkitPluginWithNpmInfo>> {
    const searchText = SearchText.create()
    searchText.keywords(['bilitoolkit-plugin'])
    if (!showThirdPartyPlugins) {
      searchText.author(appEnv.APP_AUTHOR)
    }
    const all: NpmSearchResultItem[] = []
    let total = 0
    do {
      const result = await searchPackages({ text: searchText.toString(), size: 250, from: all.length })
      all.push(...result.objects)
      total = result.total
      if (!result.objects.length) break
    } while (all.length < total)
    const matches = await this.sortNpmPlugins(
      all.filter(
        (p) =>
          !blockedPluginIds.includes(p.package.name) &&
          matchesPluginSearch(parseNpmSearchResultPkg(p.package), name || ''),
      ),
    )
    for (const entry of matches) usePluginUpdates().recordLatest(parseNpmSearchResultPkg(entry.package))
    const resultPage = matches.slice((pageNum - 1) * pageSize, pageNum * pageSize)
    return {
      pageNum: pageNum,
      pageSize: pageSize,
      total: matches.length,
      totalPages: Math.ceil(matches.length / pageSize),
      data: resultPage.map((p) => {
        return {
          ...parseNpmSearchResultPkg(p.package),
          downloads: {
            weekly: p.downloads.weekly,
            monthly: p.downloads.monthly,
          },
          searchScore: p.searchScore,
        } satisfies ToolkitPluginWithNpmInfo
      }),
    }
  }

  static async install(plugin: ToolkitPlugin) {
    const installedPlugin = await toolkitApi.core.installPlugin({
      ...toIPC(plugin),
      installDate: getFormattedDate(),
    })
    useAppInstalledPlugins().addPlugin(installedPlugin)
    return installedPlugin
  }

  static async update(plugin: ToolkitPlugin) {
    const updates = usePluginUpdates()
    if (updates.updating[plugin.id]) throw new AppError('该插件正在更新')
    updates.updating[plugin.id] = true
    try {
      const appInstalledPlugins = useAppInstalledPlugins()
      const oldPlugin = appInstalledPlugins.find(plugin.id)
      if (!oldPlugin) throw new AppError('内部错误，插件未安装。请刷新后重试')

      await PluginUtils.closePluginView(oldPlugin)
      const installedPlugin = await toolkitApi.core.updatePlugin({
        ...toIPC(oldPlugin),
        installDate: getFormattedDate(),
      })
      appInstalledPlugins.addPlugin(installedPlugin)
      return installedPlugin
    } finally {
      delete updates.updating[plugin.id]
    }
  }

  static async uninstall(plugin: InstalledToolkitPlugin) {
    await this.closePluginView(plugin)
    await toolkitApi.core.uninstallPlugin(plugin.id)
    useAppInstalledPlugins().delPlugin(plugin)
    useRecentPluginsStore().removeRecent(plugin.id)
    useStarredPluginsStore().removeStar(plugin.id)
  }
}
