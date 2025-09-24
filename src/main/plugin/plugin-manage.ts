import NpmUtils from '@/main/utils/npm-utils.ts'
import type {
  PluginInstallOptions,
  ToolkitPlugin,
  InstalledToolkitPlugin,
  AppInstalledPlugins,
} from '@/shared/types/toolkit-plugin.ts'
import { windowManager } from '@/main/window/window-manager.ts'
import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.ts'
import { getAppInstalledPlugins } from '@/main/utils/host-app-utils.ts'
import { CommonError } from '@ybgnb/utils'
import { FileUtils } from '@/main/utils/file-utils.ts'
import { appPath } from '@/main/common/app-path.ts'
import type { PackageJSON } from '@npm/types'
import path from 'path'
import { mainLogger } from '@/main/common/main-logger.ts'

class PluginManager {
  private registry: AppInstalledPlugins

  constructor() {
    this.registry = getAppInstalledPlugins()
  }

  reLoadPlugins() {
    this.registry = getAppInstalledPlugins()
  }

  getInstalledPlugin(id: string): InstalledToolkitPlugin {
    const plugin = this.registry.plugins.get(id)
    if (!plugin) {
      throw new CommonError('插件未安装！')
    }
    return plugin
  }

  readPackageJSON(pluginRootPath: string) {
    return FileUtils.readJsonFile<PackageJSON>(path.join(pluginRootPath, 'package.json'))
  }

  loadPluginFiles(plugin: PluginInstallOptions): InstalledToolkitPlugin {
    const pluginRootPath = path.join(appPath.pluginsPath, NpmUtils.pkgNameToDirName(plugin.id))
    const size = FileUtils.getFolderSizeSync(pluginRootPath) / 1024
    const sizeDesc = FileUtils.formatKBSize(size)
    return {
      ...plugin,
      files: {
        rootPath: pluginRootPath,
        distPath: path.join(pluginRootPath, 'dist'),
        indexPath: path.join(pluginRootPath, 'dist', 'index.html'),
        size: size,
        sizeDesc: sizeDesc,
      },
    } satisfies InstalledToolkitPlugin
  }

  async installPlugin(options: PluginInstallOptions) {
    mainLogger.info(`插件${options.id} ${options.version} 安装中……`)
    const pluginDir = await NpmUtils.downloadPluginPackage(options.id, options.version)
    const plugin = this.loadPluginFiles(options)
    this.registry.plugins.set(options.id, plugin)
    mainLogger.info(`插件${options.id} ${options.version} 安装成功！`)
    return plugin
  }

  async openPlugin(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const installedPlugin = this.getInstalledPlugin(plugin.id)
    await windowManager.createPluginView(context, installedPlugin)
    windowManager.showPluginView(context, plugin)
  }
}

export const pluginManager = new PluginManager()
