import { type AppSettings, DevToolsType } from '@/shared/types/app-settings.js'
import type { AppInstalledPlugins } from '@/shared/types/toolkit-plugin.js'

/**
 * 默认的应用设置
 */
export const defaultAppSettings: AppSettings = {
  devToolsType: DevToolsType.MAIN,
} as const

export const defaultAppInstalledPlugins: AppInstalledPlugins = {
  appVersion: import.meta.env.APP_VERSION,
  plugins: [],
}

/**
 * 事件前缀
 */
export const EVENT_PREFIX = {
  TIMER: 'TIMER_',
}
