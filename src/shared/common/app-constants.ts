import { type AppSettings, DevToolsType } from '@/shared/types/app-settings.ts'
import type { AppInstalledPlugins } from '@/shared/types/toolkit-plugin.ts'

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

export const defaultPluginStars: string[] = []
