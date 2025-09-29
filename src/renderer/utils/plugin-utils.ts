import type {
  InstalledToolkitPlugin,
  PluginSearchResult,
  PluginTestOptions,
  ToolkitPlugin,
  ToolkitPluginWithNpmInfo,
} from '@/shared/types/toolkit-plugin'
import { eventBus } from '@/renderer/utils/event-bus.ts'
import { searchNpmPackages } from '@/renderer/services/npm-service.ts'
import { BaseUtils } from '@ybgnb/utils'
import { sanitizeForIPC, toolkitApi } from '@/renderer/api/toolkit-api.ts'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.ts'
import { PluginParseUtils } from '@/shared/utils/plugin-parse-utils.ts'
import { appEnv } from '@/shared/common/app-env.ts'
import type { NpmPackage } from '@/shared/types/npm-types.ts'

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

  static async testPlugin(options: PluginTestOptions) {
    const plugin = await toolkitApi.core.testPlugin(options)
    eventBus.emit('openPluginView', { plugin: plugin })
    return plugin
  }

  private static isSameAuthor(npmPackage: NpmPackage) {
    return npmPackage.package.publisher.username === appEnv.env.APP_AUTHOR
  }

  /**
   * 排序npm上的插件（推荐插件>同作者>其他）
   * @param plugins
   */
  static async sortNpmPlugins(plugins: NpmPackage[]): Promise<NpmPackage[]> {
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

  static async searchNpmPlugins(page = 1) {
    const ps = await searchNpmPackages({
      keywords: 'bilitoolkit-plugin',
      page: page,
    })
    ps.objects = await this.sortNpmPlugins(ps.objects)
    return {
      total: ps.total,
      time: ps.time,
      plugins: ps.objects.map((p) => {
        return {
          id: p.package.name,
          name: PluginParseUtils.parsePluginName(p.package.name, p.package.keywords),
          author: p.package.publisher.username,
          description: p.package.description,
          version: p.package.version,
          date: BaseUtils.getFormattedDate(new Date(p.package.date)),
          links: p.package.links,
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
      ...sanitizeForIPC(plugin),
      installDate: BaseUtils.getFormattedDate(),
    })
    const { addPlugin } = useAppInstalledPlugins()
    addPlugin(installedPlugin)
    return installedPlugin
  }
  static async uninstall(plugin: InstalledToolkitPlugin) {
    await this.closePluginView(plugin)
    await toolkitApi.core.uninstallPlugin(plugin.id)
    const { delPlugin } = useAppInstalledPlugins()
    delPlugin(plugin)
  }
}
