import type {
  AppInstalledPlugins,
  InstalledToolkitPlugin,
  PluginInstallOptions,
  PluginTestOptions,
  ToolkitPlugin,
} from '@/shared/types/toolkit-plugin.js'
import { windowManager } from '@/main/window/window-manager.js'
import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.js'
import { getAppInstalledPlugins, writeHostDBDoc } from '@/main/utils/host-app.js'
import { mainLogger } from '@/main/common/main-logger.js'
import { cloneDeep } from 'lodash-es'
import { APP_DB_KEYS } from '@/shared/common/app-db.js'
import { loadTestPlugin, loadInstalledPlugin } from '@/main/plugin/loader.js'
import { downloadPlugin, removePluginFile } from '@/main/plugin/install.js'
import fs from 'fs'
import path from 'path'
import { getPackage, type NpmPackage } from 'public-registry-api'
import { lt, eq } from 'semver'
import { AppError } from 'bilitoolkit-types'

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
    mainLogger.info(`插件已加载`, Array.from(this.registry.plugins.keys()))
  }

  getInstalledPlugins(): AppInstalledPlugins {
    return {
      appVersion: this.registry.appVersion,
      plugins: Array.from(this.registry.plugins.values()),
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
      throw new AppError('插件未安装！')
    }
    return plugin
  }

  async installPlugin(options: PluginInstallOptions) {
    mainLogger.info(`插件 ${options.id} ${options.version} 安装中…`)
    const plugin = await loadInstalledPlugin(await downloadPlugin(options))
    this.registerPlugin(plugin)
    mainLogger.info(`插件 ${options.id} ${options.version} 安装成功！`)
    return plugin
  }

  async updatePlugin(plugin: InstalledToolkitPlugin) {
    mainLogger.info(`插件 ${plugin.id} ${plugin.version} 更新中…`)
    let pkg: NpmPackage
    try {
      pkg = await getPackage(plugin.id)
    } catch {
      throw new AppError('未查询到该插件的包信息，请确认是否已发布到 npm 仓库')
    }

    const lastVersion = pkg['dist-tags'].latest

    if (lt(lastVersion, plugin.version)) {
      throw new AppError('当前插件版本高于npm仓库的版本')
    }

    if (eq(lastVersion, plugin.version)) {
      throw new AppError('当前插件已经是最新版本')
    }

    const updatedPlugin = await loadInstalledPlugin(
      await downloadPlugin({
        ...plugin,
        version: lastVersion,
      }),
    )
    this.registerPlugin(plugin)
    mainLogger.info(`插件 ${updatedPlugin.id} ${updatedPlugin.version} 安装成功！`)
    return updatedPlugin
  }

  async uninstallPlugin(id: string): Promise<void> {
    const plugin = this.getInstalledPlugin(id)
    mainLogger.info(`插件 ${plugin.id} ${plugin.version} 卸载中…`)
    await removePluginFile(plugin)
    this.unregisterPlugin(plugin.id)
    mainLogger.info(`插件 ${plugin.id} ${plugin.version} 卸载成功`)
  }

  async openPlugin(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const installedPlugin = this.getInstalledPlugin(plugin.id)
    const indexPath = installedPlugin.files.indexPath
    if (path.isAbsolute(indexPath) && !fs.existsSync(indexPath)) {
      throw new AppError('插件文件不存在，请重新安装')
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
    mainLogger.info(`测试插件 ${options.pluginPath} 加载中……`)
    for (const oldPlugin of this.registry.plugins.values()) {
      if (oldPlugin.isTest && oldPlugin.files.indexPath === options.pluginPath) {
        mainLogger.info(`插件已存在 ${oldPlugin.id} ${oldPlugin.version} `)
        return oldPlugin
      }
    }
    const plugin = await loadTestPlugin(options)
    this.registerPlugin(plugin)
    return plugin
  }
}

export const pluginManager = new PluginManager()
