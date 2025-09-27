import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin'
import mitt from 'mitt'

type Events = {
  openPluginView: {
    plugin: ToolkitPlugin
  }
  closePluginView: {
    plugin: ToolkitPlugin
  }
  hideCurrPluginView: void
}

export const eventBus = mitt<Events>()
