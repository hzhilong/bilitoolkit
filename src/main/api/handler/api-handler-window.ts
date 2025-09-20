import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { BrowserWindow } from 'electron'
import type { ApiCallerContext, IpcToolkitWindowApi } from '@/main/types/ipc-toolkit-api.ts'
import type { BaseWindowManager } from '@/main/window/base-window-manager.ts'

/**
 * 窗口API处理器
 */
export class WindowApiHandler extends ApiHandleStrategy implements IpcToolkitWindowApi {
  private windowManage: BaseWindowManager

  // 存储 BrowserWindow 到 窗口上次大小 的映射
  private readonly windowToLastSize
  // 存储 BrowserWindow 到 窗口上次位置 的映射
  private readonly windowToLastPosition

  constructor(wm: BaseWindowManager) {
    super()
    this.windowManage = wm
    this.windowToLastSize = new Map<BrowserWindow, number[]>()
    this.windowToLastPosition = new Map<BrowserWindow, number[]>()
  }

  /**
   * 关闭窗口
   * @param context 插件上下文
   */
  async close(context: ApiCallerContext): Promise<void> {
    const window = context.window
    // 关闭并删除全局映射
    this.windowManage.closeWindow(context)
    // 清空全局映射
    if (this.windowToLastSize.has(window)) {
      this.windowToLastSize.delete(window)
    }
    if (this.windowToLastPosition.has(window)) {
      this.windowToLastPosition.delete(window)
    }
  }

  /**
   * 最大化窗口
   * @param context 插件上下文
   * @param max 最大化/取消最大化
   */
  async maximize(context: ApiCallerContext, max: boolean): Promise<void> {
    const window = context.window
    if (max) {
      // 最大化
      this.windowToLastSize.set(window, window.getSize())
      this.windowToLastPosition.set(window, window.getPosition())
      window?.maximize()
    } else {
      // 设置frame: false后 window.restore()就无效了，所以这里手动恢复
      if (this.windowToLastSize.has(window) && this.windowToLastPosition.has(window)) {
        // 恢复之前的窗口大小和位置
        const lastSize = this.windowToLastSize.get(window) as number[]
        window.setSize(lastSize[0], lastSize[1])
        const lastPosition = this.windowToLastPosition.get(window) as number[]
        window.setPosition(lastPosition[0], lastPosition[1])
      } else {
        // 恢复默认的窗口大小和移动到屏幕中间
        window.setSize(window.getMinimumSize()[0], window.getMinimumSize()[1])
        window.center()
      }
    }
  }

  /**
   * 最小化窗口
   * @param context 插件上下文
   */
  async minimize(context: ApiCallerContext): Promise<void> {
    const window = context.window
    if (window.minimizable) {
      window.minimize()
    }
  }
}
