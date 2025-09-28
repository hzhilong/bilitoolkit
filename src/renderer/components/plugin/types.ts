import type { ToolkitPlugin, InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

export type CardType = 'market' | 'manage' | 'no-options'

export interface PluginCardProps<T extends CardType> {
  plugin: T extends 'manage' ? InstalledToolkitPlugin : ToolkitPlugin
  type: T
}

export interface PluginListProps<T extends CardType> {
  plugins: T extends 'manage' ? Array<InstalledToolkitPlugin> : Array<ToolkitPlugin>
  type: T
}
