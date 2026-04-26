import type {
  AppInstalledPlugins,
  InstalledToolkitPlugin,
  PluginInstallOptions,
  PluginTestOptions,
  ToolkitPlugin,
} from '@/shared/types/toolkit-plugin.ts'
import { windowManager } from '@/main/window/window-manager.ts'
import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.ts'
import { getAppInstalledPlugins, writeHostDBDoc } from '@/main/utils/host-app.ts'
import { CommonError } from '@ybgnb/utils'
import { mainLogger } from '@/main/common/main-logger.ts'
import { cloneDeep } from 'lodash-es'
import { APP_DB_KEYS } from '@/shared/common/app-db.ts'
import { loadTestPlugin, loadInstalledPlugin } from '@/main/plugin/loader.ts'
import { downloadPlugin, removePluginFile } from '@/main/plugin/install.ts'
import fs from 'fs'
import path from 'path'

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
  }

  getInstalledPlugins(): AppInstalledPlugins {
    return {
      appVersion: this.registry.appVersion,
      plugins: this.registry.plugins.values().toArray(),
    }
  }

  updateDB() {
    writeHostDBDoc(APP_DB_KEYS.APP_INSTALLED_PLUGINS, cloneDeep(this.getInstalledPlugins()))
  }

  private registerPlugin(plugin: InstalledToolkitPlugin, updateDB: boolean = true) {
    this.registry.plugins.set(plugin.id, plugin)
    if (updateDB) {
      this.updateDB()
    }
  }

  private unregisterPlugin(pluginId: string, updateDB: boolean = true) {
    this.registry.plugins.delete(pluginId)
    if (updateDB) {
      this.updateDB()
    }
  }

  getInstalledPlugin(id: string): InstalledToolkitPlugin {
    const plugin = this.registry.plugins.get(id)
    if (!plugin) {
      throw new CommonError('插件未安装！')
    }
    return plugin
  }

  async installPlugin(options: PluginInstallOptions) {
    mainLogger.info(`插件${options.id} ${options.version} 安装中……`)
    const plugin = loadInstalledPlugin(await downloadPlugin(options))
    this.registerPlugin(plugin)
    mainLogger.info(`插件${options.id} ${options.version} 安装成功！`)
    return plugin
  }

  async uninstallPlugin(id: string): Promise<void> {
    const plugin = this.getInstalledPlugin(id)
    mainLogger.info(`插件${plugin.id} ${plugin.version} 卸载中……`)
    removePluginFile(plugin)
    this.unregisterPlugin(plugin.id)
    mainLogger.info(`插件${plugin.id} ${plugin.version} 卸载成功`)
  }

  async openPlugin(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const installedPlugin = this.getInstalledPlugin(plugin.id)
    const indexPath = installedPlugin.files.indexPath
    if (path.isAbsolute(indexPath) && !fs.existsSync(indexPath)) {
      throw new Error('插件文件不存在，请重新安装')
    }
    await windowManager.createPluginView(context, installedPlugin)
    windowManager.showPluginView(context, plugin)
  }

  async closePlugin(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const installedPlugin = this.getInstalledPlugin(plugin.id)
    if (installedPlugin.isTest) {
      //      removeTestPlugin(installedPlugin)
      //      this.unregisterPlugin(plugin.id)
    }
    windowManager.closePluginView(context, plugin)
  }

  async hideCurrPlugin(context: ApiCallerContext) {
    const contentView = context.window.contentView
    if (contentView.children && contentView.children.length > 0) {
      contentView.removeChildView(contentView.children[0])
    }
  }

  async loadTestPlugin(context: ApiCallerContext, options: PluginTestOptions) {
    mainLogger.info(`测试插件${options.pluginPath} 加载中……`)
    const plugin = loadTestPlugin(options)
    this.registerPlugin(plugin)
    mainLogger.info(`插件${plugin.id} ${plugin.version} 加载成功！`)
    return plugin
  }
}

export const pluginManager = new PluginManager()
