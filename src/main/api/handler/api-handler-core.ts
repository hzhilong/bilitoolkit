import { appPath } from '@/main/common/app-path'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { FileUtils } from '@/main/utils/file-utils'
import type { ApiCallerContext, IpcToolkitCoreApi } from '@/main/types/ipc-toolkit-api.ts'
import type { PluginInstallOptions, ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
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

  getInstalledPlugins(_: ApiCallerContext): Promise<ToolkitPlugin[]> {
    // TODO
    return Promise.resolve([])
  }

  installPlugin(_: ApiCallerContext, options: PluginInstallOptions): Promise<ToolkitPlugin> {
    // TODO
    return Promise.reject(undefined)
  }

  uninstallPlugin(_: ApiCallerContext, id: string): Promise<void> {
    // TODO
    return Promise.resolve(undefined)
  }

  async openPlugin(context: ApiCallerContext, plugin: ToolkitPlugin): Promise<void> {
    await windowManager.createPluginView(context, plugin)
    windowManager.showPluginView(context, plugin)
  }

  async closePlugin(context: ApiCallerContext, plugin: ToolkitPlugin): Promise<void> {
    windowManager.closePluginView(context, plugin)
  }


  async hideCurrPlugin(context: ApiCallerContext): Promise<void> {
    const contentView = context.window.contentView
    if (contentView.children && contentView.children.length > 0) {
      contentView.removeChildView(contentView.children[0])
    }
  }

  async hideAppDialogWindow(context: ApiCallerContext): Promise<void> {
    // TODO
  }
}
