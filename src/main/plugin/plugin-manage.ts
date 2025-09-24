import { mainLogger } from '@/main/common/main-logger.ts'
import NpmUtils from '@/main/utils/npm-utils.ts'
import type { PluginInstallOptions } from '@/shared/types/toolkit-plugin.ts'

const loadInstalledPlugins = () => {
  mainLogger.info('加载插件中...')
}
const uninstallPlugin = () => {}

class PluginManager {
  async installPlugin(options: PluginInstallOptions) {
    await NpmUtils.downloadPluginPackage(options.id, options.version)
  }
}

export const pluginManager = new PluginManager()
