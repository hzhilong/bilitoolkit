import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin'
import { eventBus } from '@/renderer/utils/event-bus.ts'

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
}
