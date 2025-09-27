import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

export interface PluginMeta {
  id: string | undefined
  version: string | undefined
}

const pluginMeta: PluginMeta = {
  id: '',
  version: '',
}

export default pluginMeta

/**
 * 注入元数据
 * @param plugin
 */
export const injectingPluginMetadata = (plugin: InstalledToolkitPlugin) => {
  return [`--plugin-id=${plugin.id}`, `--plugin-version=${plugin.version}`]
}

/**
 * 加载元数据
 */
export const loadPluginMetadata = () => {
  const args = process.argv.filter((arg) => arg.startsWith('--'))
  pluginMeta.id = args.find((arg) => arg.startsWith('--plugin-id='))?.split('=')[1]
  pluginMeta.version = args.find((arg) => arg.startsWith('--plugin-version='))?.split('=')[1]
}
