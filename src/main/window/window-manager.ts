import { BrowserWindow, globalShortcut, ipcMain, type HandlerDetails, Menu } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import { execBiz } from '@ybgnb/utils'
import type { PluginApiInvokeOptions } from '@/shared/types/api-invoke.js'
import { ToolkitApiDispatcher } from '@/main/api/handler/toolkit-api-dispatcher.js'
import { BaseWindowManager } from '@/main/window/base-window-manager.js'
import { showDevTools } from '@/main/utils/dev-tools.js'
import { isLogApiResult, mainLogger, mainConsoleLogger, mainFileLogger } from '@/main/common/main-logger.js'
import { appPath } from '@/main/common/app-path.js'
import { updateElectronApp } from 'update-electron-app'
import { BiliApiBusinessError } from '@ybgnb/bili-api'
import { appEnv } from '@ybgnb/vite-env/common'
import { initDatabase } from '@/main/db/init.js'
import { IGNORE_LOGGING_PATHS } from '@/main/common/main-constants.js'
import { taskRuntime } from '@/main/plugin/task/runtime.js'

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
  readonly apiDispatcher: ToolkitApiDispatcher

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
      return await this.handlePluginApiInvoke(options, event)
    })
    // 设置菜单
    Menu.setApplicationMenu(null)
    // 应用更新检测
    if (appEnv.PROD) {
      updateElectronApp()
    }
    // 在开发环境和生产环境均可通过快捷键打开devTools
    globalShortcut.register('CommandOrControl+Shift+i', function () {
      showDevTools()
    })
    // 初始化数据库
    await initDatabase()
    // 初始化对话框视图
    await this.initAppDialogView()
    // 初始化任务调度
    void taskRuntime.bootstrap()
    if (appPath.devUrl) {
      // 开发
      mainWindow.loadURL(appPath.devUrl).then(() => {})
    } else {
      // 生产
      mainWindow.loadFile(appPath.appURL).then(() => {})
    }
    // 监听主窗口的 close 事件
    mainWindow.on('close', async () => {
      // 取消所有任务
      await taskRuntime.cancelAll()
    })
    mainWindow.webContents.setWindowOpenHandler((_: HandlerDetails) => {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          menu: null,
          icon: appPath.defaultWindowIcon,
        },
      }
    })
  }

  /**
   * 处理插件 API 调用
   */
  private async handlePluginApiInvoke(options: PluginApiInvokeOptions, event: Electron.IpcMainInvokeEvent) {
    return await execBiz(async () => {
      let logPrefix = `[${options.module}.${options.name}]`
      try {
        const apiCallerContext = this.getApiCallerContext(event)
        logPrefix = `[${apiCallerContext.envType}] ${apiCallerContext.envType === 'plugin' ? `${apiCallerContext.plugin.id} ` : ''}${logPrefix}`
        const isDialog = apiCallerContext.envType === 'host' && apiCallerContext.isDialogWebContents
        if (!isDialog) {
          handleLogger(options, logPrefix, '执行中', 'arg', options?.args)
        }
        const result = await this.apiDispatcher.handle(event, options, apiCallerContext)
        if (!isDialog) {
          handleLogger(options, logPrefix, '执行成功', 'rep', isLogApiResult(result) ? result : null)
        }
        return result
      } catch (e) {
        if (e instanceof BiliApiBusinessError) {
          mainLogger.error(`${logPrefix} 执行错误`, e.message)
        } else {
          mainLogger.error(`${logPrefix} 执行错误`, e)
        }
        throw e
      }
    })
  }
}

// 格式化大小
function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1000
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)
  return `${size.toFixed(1)} ${units[i]}`
}

// 处理日志打印
function handleLogger(
  options: Omit<PluginApiInvokeOptions, 'args'>,
  logPrefix: string,
  status: string,
  dataName: 'arg' | 'rep',
  data: unknown,
) {
  if (IGNORE_LOGGING_PATHS.includes(`${options.module}.${options.name}`)) return
  if (data == null || data === '') {
    mainLogger.info(`${logPrefix} ${status}`)
    return
  }
  const jsonData = JSON.stringify(data)
  const argSize = jsonData.length ?? 0
  if (argSize > 300) {
    // 参数过长时，不在控制台打印具体参数
    mainConsoleLogger.info(`${logPrefix} ${status} ${dataName} size: ${formatSize(argSize)}`)
    mainFileLogger.info(`${logPrefix} ${status}`, jsonData)
  } else {
    mainLogger.info(`${logPrefix} ${status}`, jsonData)
  }
}

/**
 * 窗口管理单例
 */
export const windowManager = new WindowManager()
