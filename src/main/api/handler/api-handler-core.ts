import { appPath } from '@/main/common/app-path'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { FileUtils } from '@/main/utils/file-utils'
import type { ApiCallerContext, IpcToolkitCoreApi } from '@/main/types/ipc-toolkit-api.ts'
import {
  type AppInstalledPlugins,
  type InstalledToolkitPlugin,
  isInstalledToolkitPlugin,
  type PluginInstallOptions,
  type PluginTestOptions,
  type ToolkitPlugin
} from '@/shared/types/toolkit-plugin.ts'
import { IconUtils } from '@/main/utils/icon-utils.ts'
import { pluginManager } from '@/main/plugin/plugin-manage.ts'
import { windowManager } from '@/main/window/window-manager.ts'

/**
 * 核心API处理器
 */
export class CoreApiHandler extends ApiHandleStrategy implements IpcToolkitCoreApi {
  constructor() {
    super()
  }
  openLogsFolder(_: ApiCallerContext): Promise<void> {
    return FileUtils.showItemInFolder(appPath.logsPath)
  }

  openDBsFolder(_: ApiCallerContext): Promise<void> {
    return FileUtils.showItemInFolder(appPath.dbPath)
  }

  openFilesFolder(_: ApiCallerContext): Promise<void> {
    return FileUtils.showItemInFolder(appPath.filePath)
  }

  async getLogsFolderSize(_: ApiCallerContext): Promise<string> {
    return FileUtils.formatKBSize(FileUtils.getFolderSizeSync(appPath.logsPath) / 1024)
  }

  async getDBsFolderSize(_: ApiCallerContext): Promise<string> {
    return FileUtils.formatKBSize(FileUtils.getFolderSizeSync(appPath.dbPath) / 1024)
  }

  async getFilesFolderSize(_: ApiCallerContext): Promise<string> {
    return FileUtils.formatKBSize(FileUtils.getFolderSizeSync(appPath.filePath) / 1024)
  }

  async updatedLoggedInAccounts(_: ApiCallerContext): Promise<void> {
    // TODO
  }

  async getAppInstalledPlugins(_: ApiCallerContext): Promise<AppInstalledPlugins> {
    return pluginManager.getAppInstalledPlugins()
  }

  getRecommendedPlugins(_: ApiCallerContext): Promise<ToolkitPlugin[]> {
    return pluginManager.getRecommendedPlugins()
  }

  async installPlugin(_: ApiCallerContext, options: PluginInstallOptions): Promise<InstalledToolkitPlugin> {
    return await pluginManager.installPlugin(options)
  }

  async uninstallPlugin(_: ApiCallerContext, id: string): Promise<void> {
    return await pluginManager.uninstallPlugin(id)
  }

  async openPlugin(context: ApiCallerContext, plugin: ToolkitPlugin): Promise<void> {
    return await pluginManager.openPlugin(context, plugin)
  }

  async closePlugin(context: ApiCallerContext, plugin: ToolkitPlugin): Promise<void> {
    return await pluginManager.closePlugin(context, plugin)
  }

  async hideCurrPlugin(context: ApiCallerContext): Promise<void> {
    return await pluginManager.hideCurrPlugin(context)
  }

  async hideAppDialogWindow(context: ApiCallerContext): Promise<void> {
    return windowManager.hideAppDialogView(context)
  }

  testPlugin(context: ApiCallerContext, options: PluginTestOptions): Promise<InstalledToolkitPlugin> {
    return pluginManager.testPlugin(context, options)
  }

  async getPluginIcon(context: ApiCallerContext, plugin: ToolkitPlugin): Promise<string> {
    if (isInstalledToolkitPlugin(plugin)) {
      return IconUtils.getInstalledPluginIcon(plugin)
    }
    return await IconUtils.downloadPluginIcon(plugin)
  }
}
