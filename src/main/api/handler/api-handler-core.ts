import { appPath } from '@/main/common/app-path.js'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import type { ApiCallerContext, IpcToolkitCoreApi } from '@/main/types/ipc-toolkit-api.js'
import {
  type AppInstalledPlugins,
  type InstalledToolkitPlugin,
  isInstalledToolkitPlugin,
  type PluginInstallOptions,
  type PluginTestOptions,
  type ToolkitPlugin,
} from '@/shared/types/toolkit-plugin.js'
import { IconUtils } from '@/main/utils/icon.js'
import { pluginManager } from '@/main/plugin/manager.js'
import { windowManager } from '@/main/window/window-manager.js'
import { getRecommendedPlugins, getBlockedPluginIds } from '@/main/plugin/loader.js'
import type { UserInfoWithCookie } from '@ybgnb/bili-api'
import type { UserListSyncResult } from '@/shared/types/toolkit-core-api.js'
import { userService } from '@/main/service/user.service.js'
import { getFileSizeKB, formatFileSizeFromKB } from '@ybgnb/utils/node'
import { showItemInFolder } from '@/main/utils/file.js'

/**
 * 核心API处理器
 */
export class CoreApiHandler extends ApiHandleStrategy implements IpcToolkitCoreApi {
  constructor() {
    super()
  }
  openLogsFolder(_: ApiCallerContext): Promise<void> {
    return showItemInFolder(appPath.logsPath)
  }

  openDBsFolder(_: ApiCallerContext): Promise<void> {
    return showItemInFolder(appPath.dbPath)
  }

  openFilesFolder(_: ApiCallerContext): Promise<void> {
    return showItemInFolder(appPath.filePath)
  }

  async getLogsFolderSize(_: ApiCallerContext): Promise<string> {
    return formatFileSizeFromKB(await getFileSizeKB(appPath.logsPath))
  }

  async getDBsFolderSize(_: ApiCallerContext): Promise<string> {
    return formatFileSizeFromKB(await getFileSizeKB(appPath.dbPath))
  }

  async getFilesFolderSize(_: ApiCallerContext): Promise<string> {
    return formatFileSizeFromKB(await getFileSizeKB(appPath.filePath))
  }

  async getInstalledPlugins(_: ApiCallerContext): Promise<AppInstalledPlugins> {
    return pluginManager.getInstalledPlugins()
  }

  getRecommendedPlugins(_: ApiCallerContext): Promise<ToolkitPlugin[]> {
    return getRecommendedPlugins()
  }

  getBlockedPluginIds(_: ApiCallerContext): Promise<string[]> {
    return getBlockedPluginIds()
  }

  async installPlugin(_: ApiCallerContext, options: PluginInstallOptions): Promise<InstalledToolkitPlugin> {
    return await pluginManager.installPlugin(options)
  }

  async updatePlugin(_: ApiCallerContext, plugin: InstalledToolkitPlugin): Promise<InstalledToolkitPlugin> {
    return await pluginManager.updatePlugin(plugin)
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

  async clearPluginIconCache(_context: ApiCallerContext): Promise<void> {
    return await IconUtils.clearPluginIconCache()
  }

  syncUserList(context: ApiCallerContext, users: UserInfoWithCookie[]): Promise<UserListSyncResult> {
    return userService.syncUserList(users)
  }
}
