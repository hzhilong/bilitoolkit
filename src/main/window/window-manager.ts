import { BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.ts'
import { execBiz } from '@ybgnb/utils'
import type { PluginApiInvokeOptions } from '@/shared/types/api-invoke.ts'
import { ToolkitApiDispatcher } from '@/main/api/handler/toolkit-api-dispatcher.ts'
import { BaseWindowManager } from '@/main/window/base-window-manager.ts'
import { showDevTools } from '@/main/utils/dev-tools.ts'
import { mainLogger } from '@/main/common/main-logger.ts'
import { biliApi } from '@/main/biliapi/request/bili-api.ts'
import { appPath } from '@/main/common/app-path.ts'

type IpcMainInvokeEvent = Electron.IpcMainInvokeEvent

/**
 * 窗口管理
 *
 * 项目主要环境划分：
 *    不同窗口对应的宿主环境（应用自己的基础web内容） <=> 主进程 <=> 不同窗口对应的不同插件环境
 *
 *  一个窗口的环境：
 *    一个主窗口：BrowserWindow
 *    一个宿主环境：WebContents
 *    多个插件环境：WebContentsView
 */
export class WindowManager extends BaseWindowManager {
  // API处理器
  private readonly apiDispatcher: ToolkitApiDispatcher

  constructor() {
    super()
    this.apiDispatcher = new ToolkitApiDispatcher(this)
  }

  /**
   * 初始化主进程相关的设置
   * @param mainWindow 主窗口
   */
  public async initMainWindow(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    // 初始化插件API监听
    ipcMain.handle(IPC_CHANNELS.PLUGIN_APIS, async (event: IpcMainInvokeEvent, options: PluginApiInvokeOptions) => {
      return await execBiz(async () => {
        try {
          const apiCallerContext = this.getApiCallerContext(event)
          return await this.apiDispatcher.handle(event, options, apiCallerContext)
        } catch (e) {
          mainLogger.error(`调用API错误`, options)
          mainLogger.error(`错误信息`, e)
          throw e
        }
      })
    })
    // 在开发环境和生产环境均可通过快捷键打开devTools
    globalShortcut.register('CommandOrControl+Shift+i', function() {
      showDevTools()
    })
    // 初始化 biliApi 模块
    await biliApi.initMixinKey()
    // 初始化对话框视图
    await this.initAppDialogView()
    if (appPath.devUrl) {
      // 开发
      mainWindow.loadURL(appPath.devUrl).then(() => {})
    } else {
      // 生产
      mainWindow.loadFile(appPath.appURL).then(() => {})
    }
  }
}

/**
 * 窗口管理单例
 */
export const windowManager = new WindowManager()
