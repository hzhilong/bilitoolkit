import { appPath } from '@/main/common/app-path'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { FileUtils } from '@/main/utils/file.ts'
import type { ApiCallerContext, IpcToolkitCoreApi } from '@/main/types/ipc-toolkit-api.ts'
import {
  type AppInstalledPlugins,
  type InstalledToolkitPlugin,
  isInstalledToolkitPlugin,
  type PluginInstallOptions,
  type PluginTestOptions,
  type ToolkitPlugin,
} from '@/shared/types/toolkit-plugin.ts'
import { IconUtils } from '@/main/utils/icon.ts'
import { pluginManager } from '@/main/plugin/manager.ts'
import { windowManager } from '@/main/window/window-manager.ts'
import { getRecommendedPlugins } from '@/main/plugin/loader.ts'
import type { UserInfoWithCookie } from '@ybgnb/bili-api'
import type { UserListSyncResult } from '@/shared/types/toolkit-core-api.ts'
import { userService } from '@/main/service/user.service.ts'

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

  async getInstalledPlugins(_: ApiCallerContext): Promise<AppInstalledPlugins> {
    return pluginManager.getInstalledPlugins()
  }

  getRecommendedPlugins(_: ApiCallerContext): Promise<ToolkitPlugin[]> {
    return getRecommendedPlugins()
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

  loadTestPlugin(context: ApiCallerContext, options: PluginTestOptions): Promise<InstalledToolkitPlugin> {
    return pluginManager.loadTestPlugin(context, options)
  }

  async getPluginIcon(context: ApiCallerContext, plugin: ToolkitPlugin): Promise<string> {
    if (isInstalledToolkitPlugin(plugin)) {
      return IconUtils.getInstalledPluginIcon(plugin)
    }
    return await IconUtils.downloadPluginIcon(plugin)
  }

  syncUserList(context: ApiCallerContext, users: UserInfoWithCookie[]): Promise<UserListSyncResult> {
    return userService.syncUserList(users)
  }
}
