import { toolkitApi } from '@/renderer/api/toolkit-api'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin';
import { cloneDeep } from 'lodash'
import { eventBus } from '@/renderer/utils/event-bus.ts'

export class PluginUtils {
  static async openPluginView(plugin: ToolkitPlugin) {
    await toolkitApi.core.openPlugin(cloneDeep(plugin))
    eventBus.emit('openPluginView', { plugin: plugin })
  }

  static async closePluginView(plugin: ToolkitPlugin) {
    await toolkitApi.core.closePlugin(cloneDeep(plugin))
    eventBus.emit('closePluginView', { plugin: plugin })
  }

  static async hideCurrPluginView() {
    await toolkitApi.core.hideCurrPlugin()
    eventBus.emit('hideCurrPluginView')
  }
}
