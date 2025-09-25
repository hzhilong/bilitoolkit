import type { PluginSearchResult, ToolkitPlugin, InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin'
import { eventBus } from '@/renderer/utils/event-bus.ts'
import { searchNpmPackages } from '@/renderer/services/npm-service.ts'
import { BaseUtils } from '@ybgnb/utils'
import { toolkitApi, sanitizeForIPC } from '@/renderer/api/toolkit-api.ts'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.ts'

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

  private static parsePluginName(id: string, keywords: string[]) {
    const prefix = 'bilitoolkit-plugin:'
    for (const keyword of keywords) {
      if (keyword.startsWith(prefix) && keyword.length > prefix.length) {
        return keyword.substring(prefix.length)
      }
    }
    return id
  }

  static async searchPlugins(page = 1) {
    const ps = await searchNpmPackages({
      keywords: 'bilitoolkit-plugin',
      page: page,
    })
    return {
      total: ps.total,
      time: ps.time,
      plugins: ps.objects.map((p) => {
        return {
          id: p.package.name,
          name: this.parsePluginName(p.package.name, p.package.keywords),
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
