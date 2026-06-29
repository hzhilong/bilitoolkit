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
import { useRecommendedPlugins } from '@/renderer/stores/recommended-plugins'
import type { PageResult } from 'bilitoolkit-ui'
import { useRecentPluginsStore } from '@/renderer/stores/recent-plugins'
import { useStarredPluginsStore } from '@/renderer/stores/starred-plugins'

export class PluginUtils {
  static async openPluginView(plugin: InstalledToolkitPlugin) {
    useRecentPluginsStore().addRecent(plugin.id)
    eventBus.emit('openPluginView', { plugin: plugin })
  }

  static async closePluginView(plugin: InstalledToolkitPlugin) {
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
  }: {
    pageNum?: number
    pageSize?: number
    blockedPluginIds?: string[]
    showThirdPartyPlugins?: boolean
  }): Promise<PageResult<ToolkitPluginWithNpmInfo>> {
    const searchText = SearchText.create().keywords(['bilitoolkit-plugin'])
    if (!showThirdPartyPlugins) {
      searchText.author(appEnv.APP_AUTHOR)
    }
    const result = await searchPackages({
      text: searchText.toString(),
      size: pageSize,
      from: (pageNum - 1) * 20,
    })
    result.objects = (await this.sortNpmPlugins(result.objects)).filter(
      (p) => blockedPluginIds.indexOf(p.package.name) < 0,
    )
    return {
      pageNum: pageNum,
      pageSize: pageSize,
      total: result.total - blockedPluginIds.length,
      totalPages: Math.floor(result.total / pageSize) + 1,
      data: result.objects.map((p) => {
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
    const installedPlugin = await toolkitApi.core.updatePlugin({
      ...toIPC(plugin),
      installDate: getFormattedDate(),
    })
    useAppInstalledPlugins().addPlugin(installedPlugin)
    return installedPlugin
  }

  static async uninstall(plugin: InstalledToolkitPlugin) {
    await this.closePluginView(plugin)
    await toolkitApi.core.uninstallPlugin(plugin.id)
    useAppInstalledPlugins().delPlugin(plugin)
    useRecentPluginsStore().removeRecent(plugin.id)
    useStarredPluginsStore().removeStar(plugin.id)
  }
}
