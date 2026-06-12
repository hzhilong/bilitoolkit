import mitt from 'mitt'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin'

type Events = {
  openPluginView: {
    plugin: InstalledToolkitPlugin
  }
  closePluginView: {
    plugin: InstalledToolkitPlugin
  }
  hideCurrPluginView: void
}

export const eventBus = mitt<Events>()
