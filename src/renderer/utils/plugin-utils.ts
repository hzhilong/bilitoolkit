import type {
  InstalledToolkitPlugin,
  PluginSearchResult,
  PluginTestOptions,
  ToolkitPlugin,
} from '@/shared/types/toolkit-plugin'
import { eventBus } from '@/renderer/utils/event-bus.ts'
import { searchNpmPackages } from '@/renderer/services/npm-service.ts'
import { BaseUtils } from '@ybgnb/utils'
import { sanitizeForIPC, toolkitApi } from '@/renderer/api/toolkit-api.ts'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.ts'
import { PluginMetaUtils } from '@/shared/utils/plugin-meta-utils.ts'
import { appEnv } from '@/shared/common/app-env.ts'

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

  static async searchPlugins(page = 1) {
    const ps = await searchNpmPackages({
      keywords: 'bilitoolkit-plugin',
      page: page,
    })
    ps.objects.sort((a, b) => {
      if (a.package.publisher.username === appEnv.env.APP_AUTHOR) {
        return -1
      }
      if (b.package.publisher.username === appEnv.env.APP_AUTHOR) {
        return 1
      }
      return 0
    })
    return {
      total: ps.total,
      time: ps.time,
      plugins: ps.objects.map((p) => {
        return {
          id: p.package.name,
          name: PluginMetaUtils.parsePluginName(p.package.name, p.package.keywords),
          author: p.package.publisher.username,
          description: p.package.description,
          version: p.package.version,
          date: BaseUtils.getFormattedDate(new Date(p.package.date)),
          links: p.package.links,
        } satisfies ToolkitPlugin
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
