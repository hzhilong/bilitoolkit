import type { ToolkitPlugin, InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

export type CardType = 'market' | 'manage'

export interface PluginCardProps<T extends CardType> {
  plugin: T extends 'market' ? ToolkitPlugin : InstalledToolkitPlugin
  type: T
}

export interface PluginListProps<T extends CardType> {
  plugins: T extends 'market' ? Array<ToolkitPlugin> : Array<InstalledToolkitPlugin>
  type: T
}
