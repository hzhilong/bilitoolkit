import NpmUtils from '@/main/utils/npm-utils.ts'
import type {
  PluginInstallOptions,
  ToolkitPlugin,
  InstalledToolkitPlugin,
  AppInstalledPlugins,
  PluginTestOptions,
} from '@/shared/types/toolkit-plugin.ts'
import { windowManager } from '@/main/window/window-manager.ts'
import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.ts'
import { getAppInstalledPlugins, writeHostTxtFile, writeHostDBDoc } from '@/main/utils/host-app-utils.ts'
import { CommonError, BaseUtils } from '@ybgnb/utils'
import { FileUtils } from '@/main/utils/file-utils.ts'
import { appPath } from '@/main/common/app-path.ts'
import type { PackageJSON } from '@npm/types'
import path from 'path'
import { mainLogger } from '@/main/common/main-logger.ts'
import { HOST_EVENT_CHANNELS } from '@/shared/types/host-event-channel.ts'
import { eventBus } from '@/main/event/event-bus.ts'
import { IconUtils } from '@/main/utils/icon-utils.ts'
import { APP_FILE_KEYS } from '@/shared/common/app-files.ts'
import { cloneDeep } from 'lodash'
import { APP_DB_KEYS } from '@/shared/common/app-db.ts'
import { rmdirSync } from 'node:fs'
import { PluginMetaUtils } from '@/shared/utils/plugin-meta-utils.ts'

type PluginRegistry = {
  appVersion: string
  plugins: Map<string, InstalledToolkitPlugin>
}

class PluginManager {
  private readonly registry: PluginRegistry

  private buildRegistryPlugins(plugins: InstalledToolkitPlugin[]) {
    return new Map<string, InstalledToolkitPlugin>(plugins.map((plugin) => [plugin.id, plugin]))
  }

  constructor() {
    const installedPlugins = getAppInstalledPlugins()
    this.registry = {
      appVersion: installedPlugins.appVersion,
      plugins: this.buildRegistryPlugins(installedPlugins.plugins),
    }
    mainLogger.info(`插件已加载`, this.registry.plugins.keys().toArray())
    eventBus.on(HOST_EVENT_CHANNELS.UPDATE_APP_INSTALLED_PLUGINS, (newData: AppInstalledPlugins) => {
      this.registry.appVersion = newData.appVersion
      this.registry.plugins = this.buildRegistryPlugins(newData.plugins)
    })
  }

  getAppInstalledPlugins(): AppInstalledPlugins {
    return {
      appVersion: this.registry.appVersion,
      plugins: this.registry.plugins.values().toArray(),
    }
  }

  updateDB() {
    writeHostDBDoc(APP_DB_KEYS.APP_INSTALLED_PLUGINS, cloneDeep(this.getAppInstalledPlugins()))
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

  /**
   * 获取图标缓存的相对路径
   * @param pluginId
   * @private
   */
  private getIconCachePath(pluginId: string) {
    return path.join(APP_FILE_KEYS.PLUGIN_ICON, `${NpmUtils.pkgNameToDirName(pluginId)}.icon`)
  }

  loadPluginFiles(plugin: PluginInstallOptions, cacheIcon: boolean = true): InstalledToolkitPlugin {
    const pluginDir = NpmUtils.pkgNameToDirName(plugin.id)
    const pluginRootPath = path.join(appPath.pluginsPath, pluginDir)
    const size = FileUtils.getFolderSizeSync(pluginRootPath) / 1024
    const sizeDesc = FileUtils.formatKBSize(size)
    const iconCachePath = this.getIconCachePath(plugin.id)
    const installed = {
      ...plugin,
      files: {
        rootPath: pluginDir,
        distPath: path.join(pluginDir, 'dist'),
        indexPath: path.join(pluginDir, 'dist', 'index.html'),
        size: size,
        sizeDesc: sizeDesc,
      },
    } satisfies InstalledToolkitPlugin
    const icon = IconUtils.getInstalledPluginIcon(installed)
    if (cacheIcon) {
      writeHostTxtFile(iconCachePath, icon)
    }
    return installed
  }

  async installPlugin(options: PluginInstallOptions) {
    mainLogger.info(`插件${options.id} ${options.version} 安装中……`)
    await NpmUtils.downloadPluginPackage(options.id, options.version)
    const plugin = this.loadPluginFiles(options)
    this.registry.plugins.set(options.id, plugin)
    this.updateDB()
    mainLogger.info(`插件${options.id} ${options.version} 安装成功！`)
    return plugin
  }

  async uninstallPlugin(id: string): Promise<void> {
    const plugin = this.getInstalledPlugin(id)
    mainLogger.info(`插件${plugin.id} ${plugin.version} 卸载中……`)
    // 只删除插件文件，不删除数据库和其他文件
    rmdirSync(path.join(appPath.pluginsPath, plugin.files.rootPath), { recursive: true })
    this.registry.plugins.delete(id)
    this.updateDB()
    mainLogger.info(`插件${plugin.id} ${plugin.version} 卸载成功`)
  }

  async openPlugin(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const installedPlugin = this.getInstalledPlugin(plugin.id)
    await windowManager.createPluginView(context, installedPlugin)
    windowManager.showPluginView(context, plugin)
  }

  async closePlugin(context: ApiCallerContext, plugin: ToolkitPlugin) {
    windowManager.closePluginView(context, plugin)
  }

  async hideCurrPlugin(context: ApiCallerContext) {
    const contentView = context.window.contentView
    if (contentView.children && contentView.children.length > 0) {
      contentView.removeChildView(contentView.children[0])
    }
  }

  async testPlugin(context: ApiCallerContext, options: PluginTestOptions) {
    mainLogger.info(`插件${options.rootPath} 测试中……`)
    const packageJSON = this.readPackageJSON(options.rootPath)
    const plugin: InstalledToolkitPlugin = {
      id: packageJSON.name,
      name: PluginMetaUtils.parsePluginName(packageJSON.name, packageJSON.keywords),
      author: packageJSON.author ? String(packageJSON.author) : '',
      description: packageJSON.description ?? '',
      version: packageJSON.version,
      date: BaseUtils.getFormattedDate(),
      links: {
        npm: '',
      },
      installDate: BaseUtils.getFormattedDate(),
      files: {
        rootPath: options.rootPath,
        distPath: path.join(options.rootPath, 'dist'),
        indexPath: path.join(options.rootPath, 'dist', 'index.html'),
        size: 0,
        sizeDesc: 'test',
      },
    }
    IconUtils.getInstalledPluginIcon(plugin)
    this.registry.plugins.set(plugin.id, plugin)
    mainLogger.info(`插件${plugin.id} ${plugin.version} 加载成功！`)
    return plugin
  }
}

export const pluginManager = new PluginManager()
