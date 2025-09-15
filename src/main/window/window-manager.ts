import { appPath } from '@/main/common/app-path'
import { BrowserWindow, ipcMain } from 'electron'
import { defaultsDeep } from 'lodash'
import type { CreateWindowOptions } from '@/main/types/create-window.ts'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.ts'
import { CommonError, execBiz } from '@ybgnb/utils'
import type { PluginApiInvokeOptions } from '@/shared/types/api-invoke.ts'
import { ToolkitApiDispatcher } from '@/main/api/handler/toolkit-api-dispatcher.ts'
import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.ts'
import { getPluginDBPath } from '@/main/api/handler/api-handler-db.ts'
import { getPluginBaseFilePath } from '@/main/api/handler/api-handler-file.ts'

type WebContents = Electron.WebContents
type IpcMainInvokeEvent = Electron.IpcMainInvokeEvent

type BrowserWindowConstructorOptions = Electron.Main.BrowserWindowConstructorOptions

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
export class WindowManager {
  // 主窗口
  public mainWindow: BrowserWindow | null = null
  // API处理器
  private readonly apiDispatcher: ToolkitApiDispatcher
  // 存储 所有WebContents 到 BrowserWindow 的映射
  public readonly webContentsToWindowMap
  // 存储宿主环境 WebContents 到 BrowserWindow 的映射
  public readonly hostWebContentsToWindowMap

  constructor() {
    this.webContentsToWindowMap = new Map<WebContents, BrowserWindow>()
    this.hostWebContentsToWindowMap = new Map<WebContents, BrowserWindow>()
    this.apiDispatcher = new ToolkitApiDispatcher(this)
  }

  /**
   * 初始化主进程相关的设置
   * @param mainWindow 主窗口
   */
  public initMainWindow(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    // 初始化插件API监听
    ipcMain.handle(IPC_CHANNELS.PLUGIN_APIS, async (event: IpcMainInvokeEvent, options: PluginApiInvokeOptions) => {
      return await execBiz(async () => {
        return await this.apiDispatcher.handle(event, options, this.getApiCallerContext(event))
      })
    })
  }
  /**
   * 获取API调用的上下文
   * @param event IpcMainInvokeEvent
   */
  public getApiCallerContext(event: IpcMainInvokeEvent): ApiCallerContext {
    const sender = event.sender
    const window = this.webContentsToWindowMap.get(sender)
    if (!window) {
      throw new CommonError('关联的窗口对象为空')
    }
    if (this.hostWebContentsToWindowMap.has(event.sender)) {
      // 宿主环境调用API
      return {
        envType: 'host',
        window: window,
        webContents: sender,
        dbPath: getPluginDBPath('host'),
        filePath: getPluginBaseFilePath('host'),
      } satisfies ApiCallerContext
    } else {
      //TODO 插件环境调用API
      throw new Error('未完成')
    }
  }

  /**
   * 创建窗口
   * @param options electron创建窗口的选项
   * @param extOptions 额外的选项
   */
  public createWindow(options: BrowserWindowConstructorOptions, extOptions?: CreateWindowOptions) {
    const window = new BrowserWindow(
      defaultsDeep(options, {
        // 在 Windows/Linux 上添加窗口的控件
        // ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
        transparent: true,
        frame: false,
        resizable: true,
        webPreferences: {
          sandbox: true,
          webSecurity: false, // 禁用同源策略
          // 集成网页和 Node.js，也就是在渲染进程中，可以调用 Node.js 方法
          // contextIsolation: false,
          // nodeIntegration: true,
        },
        icon: appPath.defaultWindowIcon,
        show: false,
      }),
    )
    // 隐藏 MacOS 交通信号灯
    if (process.platform === 'darwin') {
      window.setWindowButtonVisibility(false)
    }
    if(extOptions){
      if (extOptions.show) {
        // 在加载页面时，渲染进程第一次完成绘制时，如果窗口还没有被显示，渲染进程会发出 ready-to-show 事件
        // 解决启动后右下角黑边闪烁的问题
        window.once('ready-to-show', () => {
          window.show()
        })
      }
    }
    // 添加全局映射
    this.setWindowMapping(window)
    return window
  }

  private setWindowMapping(window: BrowserWindow) {
    this.webContentsToWindowMap.set(window.webContents, window)
    this.hostWebContentsToWindowMap.set(window.webContents, window)
  }

  private removeWindowMapping(window: BrowserWindow) {
    this.webContentsToWindowMap.delete(window.webContents)
    this.hostWebContentsToWindowMap.delete(window.webContents)
  }

  public closeWindow(context: ApiCallerContext): void {
    const window = context.window
    window.close()
    this.removeWindowMapping(window)
  }
}

/**
 * 窗口管理单例
 */
export const windowManager = new WindowManager()
