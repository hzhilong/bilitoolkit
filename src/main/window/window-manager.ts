import { appPath } from '@/main/common/app-path'
import { BrowserWindow } from 'electron'
import { defaultsDeep } from 'lodash'
import type { CreateWindowOptions } from '@/main/types/create-window.ts'

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

  constructor() {}

  /**
   * 初始化主进程相关的设置
   * @param mainWindow 主窗口
   */
  public initMain(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
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
    if (extOptions) {
      if (extOptions.show) {
        // 在加载页面时，渲染进程第一次完成绘制时，如果窗口还没有被显示，渲染进程会发出 ready-to-show 事件
        // 解决启动后右下角黑边闪烁的问题
        window.once('ready-to-show', () => {
          window.show()
        })
      }
    }
    // 添加全局映射
    return window
  }
}
/**
 * 窗口管理单例
 */
export const windowManager = new WindowManager()
