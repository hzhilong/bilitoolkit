import type {
  InstalledToolkitPlugin,
  PluginSearchResult,
  PluginTestOptions,
  ToolkitPlugin,
  ToolkitPluginWithNpmInfo,
} from '@/shared/types/toolkit-plugin'
import { eventBus } from '@/renderer/utils/event-bus.ts'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.ts'
import { appEnv } from '@/shared/common/app-env.ts'
import { toolkitApi } from '@/renderer/api/toolkit-api.ts'
import { parseNpmSearchResultPkg } from '@/shared/utils/plugin-parse.ts'
import { toIPC } from 'bilitoolkit-runtime'
import { getFormattedDate } from '@ybgnb/utils'
import { searchPackages, type NpmSearchResultItem, SearchText } from 'public-registry-api'

export class PluginUtils {
  static async openPluginView(plugin: ToolkitPlugin) {
    eventBus.emit('openPluginView', { plugin: plugin })
  }

  static async closePluginView(plugin: ToolkitPlugin) {
    eventBus.emit('closePluginView', { plugin: plugin })
  }

  static async hideCurrPluginView() {
    eventBus.emit('hideCurrPluginView')
  }

  static async loadTestPlugin(options: PluginTestOptions) {
    const plugin = await toolkitApi.core.loadTestPlugin(options)
    console.log('loadTestPlugin', plugin)
    useAppInstalledPlugins().addPlugin(plugin)
    eventBus.emit('openPluginView', { plugin: plugin })
    return plugin
  }

  private static isSameAuthor(npmPackage: NpmSearchResultItem) {
    return npmPackage.package.publisher.username === appEnv.env.APP_AUTHOR
  }

  /**
   * 排序npm上的插件（推荐插件>同作者>其他）
   * @param plugins
   */
  static async sortNpmPlugins(plugins: NpmSearchResultItem[]): Promise<NpmSearchResultItem[]> {
    // 获取推荐的插件
    const recommendedPlugins = Array.from(await toolkitApi.core.getRecommendedPlugins())
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

  static async searchNpmPlugins(page = 1, pageSize: number = 20) {
    const result = await searchPackages({
      text: SearchText.create().keywords(['bilitoolkit-plugin']).toString(),
      size: pageSize,
      from: (page - 1) * 20,
    })

    result.objects = await this.sortNpmPlugins(result.objects)
    return {
      total: result.total,
      time: result.time,
      plugins: result.objects.map((p) => {
        return {
          ...parseNpmSearchResultPkg(p.package),
          downloads: {
            weekly: p.downloads.weekly,
            monthly: p.downloads.monthly,
          },
          searchScore: p.searchScore,
        } satisfies ToolkitPluginWithNpmInfo
      }),
    } satisfies PluginSearchResult
  }

  static async install(plugin: ToolkitPlugin) {
    const installedPlugin = await toolkitApi.core.installPlugin({
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
  }
}
