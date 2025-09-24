import type { WebContents } from 'electron'
import { BrowserWindow, session, WebContentsView } from 'electron'
import type { CreateWindowOptions } from '@/main/types/create-window.ts'
import type { ApiCallerContext, HostApiCallerContext, PluginApiCallerContext } from '@/main/types/ipc-toolkit-api.ts'
import { isToolkitPlugin, type ToolkitPlugin, type InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { CommonError } from '@ybgnb/utils'
import { getPluginBaseFilePath } from '@/main/api/handler/api-handler-file.ts'
import path from 'path'
import { mainLogger } from '@/main/common/main-logger.ts'
import { appPath } from '@/main/common/app-path.ts'
import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.ts'
import { getGlobalData } from '@/main/api/handler/api-handler-global.ts'
import { defaultsDeep } from 'lodash'
import DBUtils from '@/main/utils/db-utils.ts'

type Rectangle = Electron.Rectangle

type IpcMainInvokeEvent = Electron.IpcMainInvokeEvent
type BrowserWindowConstructorOptions = Electron.BrowserWindowConstructorOptions

export abstract class BaseWindowManager {
  // 主窗口
  public mainWindow: BrowserWindow | null = null
  // 存储 所有插件WebContents 到 Plugin 的映射
  public readonly webContentsToPluginMap
  public readonly webContentsToWindow
  // 存储 所有插件WebContents 到 WebContentsView 的映射
  public readonly webContentsToViewMap
  public readonly pluginToViewMap
  private readonly pluginResizeListeners
  // app对话框窗口
  public appDialogWindow: BrowserWindow | undefined = undefined

  protected constructor() {
    this.webContentsToPluginMap = new Map<number, ToolkitPlugin>()
    this.webContentsToViewMap = new Map<number, WebContentsView>()
    this.webContentsToWindow = new Map<number, BrowserWindow>()
    this.pluginToViewMap = new Map<string, WebContentsView>()
    this.pluginResizeListeners = new Map<string, () => void>()
  }

  protected getOwnerBrowserWindow(contents: WebContents): BrowserWindow {
    const window = this.webContentsToWindow.get(contents.id)
    if (!window) throw new CommonError('关联的窗口对象为空')
    return window
  }

  protected getMappingPlugin(sender: WebContents): ToolkitPlugin {
    const plugin = this.webContentsToPluginMap.get(sender.id)
    if (!plugin) throw new CommonError('内部错误，关联的插件为空')
    return plugin
  }

  protected getMappingView(sender: WebContents | ToolkitPlugin): WebContentsView {
    let view
    if (isToolkitPlugin(sender)) {
      view = this.pluginToViewMap.get(sender.id)
    } else {
      view = this.webContentsToViewMap.get(sender.id)
    }
    if (!view) throw new CommonError('内部错误，关联的视图为空')
    return view
  }

  protected isHost(sender: WebContents) {
    return !this.webContentsToPluginMap.has(sender.id)
  }

  /**
   * 获取API调用的上下文
   * @param event IpcMainInvokeEvent
   */
  public getApiCallerContext(event: IpcMainInvokeEvent): ApiCallerContext {
    const sender = event.sender
    const window = this.getOwnerBrowserWindow(sender)
    if (this.isHost(sender)) {
      // 宿主环境调用API
      return {
        envType: 'host',
        window: window,
        webContents: sender,
        dbPath: DBUtils.getDBPath('host'),
        filePath: getPluginBaseFilePath('host'),
      } satisfies HostApiCallerContext
    } else {
      // 插件环境调用API
      const plugin = this.getMappingPlugin(sender)
      return {
        envType: 'plugin',
        plugin: plugin,
        window: window,
        webContents: sender,
        webContentsView: this.getMappingView(sender),
        hostWebContents: window.webContents,
        dbPath: DBUtils.getDBPath('plugin', plugin),
        filePath: getPluginBaseFilePath('plugin', plugin),
      } satisfies PluginApiCallerContext
    }
  }

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
    this.webContentsToWindow.set(window.webContents.id, window)
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
    return window
  }
  public closeWindow(context: ApiCallerContext) {
    const window = context.window
    this.webContentsToWindow.delete(window.webContents.id)
    window.close()
  }
  public async createPluginView(context: ApiCallerContext, plugin: InstalledToolkitPlugin) {
    if (!this.isHost(context.webContents)) {
      throw new CommonError('非法调用')
    }
    const window = context.window
    mainLogger.debug(`createPluginView`, plugin)
    try {
      const webView = this.getMappingView(plugin)
      if (webView) {
        mainLogger.info(`createPluginView 插件[${plugin.id}]已存在`)
        return webView
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (ignoredError) {}

    const ses = session.fromPartition('<' + plugin.id + '>')
    const preload = path.join(appPath.preloadsDir, `plugin-preload.cjs`)
    ses.registerPreloadScript({
      filePath: preload,
      type: 'frame',
    })

    const view = new WebContentsView({
      webPreferences: {
        transparent: true,
        session: ses,
      },
    })
    const updateBounds = async () => {
      const bounds = (await getGlobalData(
        context,
        'host',
        HOST_GLOBAL_DATA.CONTENT_BOUNDS,
        false,
        undefined,
      )) as Rectangle
      view.setBounds(bounds)
    }
    window.addListener('resize', updateBounds)
    await updateBounds()

    const webContentsId = view.webContents.id
    this.webContentsToPluginMap.set(webContentsId, plugin)
    this.webContentsToViewMap.set(webContentsId, view)
    this.pluginToViewMap.set(plugin.id, view)
    this.pluginResizeListeners.set(plugin.id, updateBounds)
    this.webContentsToWindow.set(webContentsId, window)

    await view.webContents.loadURL(plugin.files.indexPath)
  }
  public showPluginView(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const contentView = context.window.contentView
    if (contentView.children && contentView.children.length > 0) {
      mainLogger.info(`showPluginView 当前${contentView.children.length}个子view`)
      contentView.children.forEach((c) => contentView.removeChildView(c))
    }
    contentView.addChildView(this.getMappingView(plugin))
  }
  public hidePluginView(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const view = this.pluginToViewMap.get(plugin.id)
    if (!view) {
      throw new CommonError('该插件未创建视图，关闭失败')
    }
    context.window.contentView.removeChildView(view)
  }
  public closePluginView(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const view = this.pluginToViewMap.get(plugin.id)
    if (!view) {
      throw new CommonError('该插件未创建视图，关闭失败')
    }
    this.webContentsToPluginMap.delete(view.webContents.id)
    this.webContentsToViewMap.delete(view.webContents.id)
    this.webContentsToWindow.delete(view.webContents.id)
    this.pluginToViewMap.delete(plugin.id)
    this.pluginResizeListeners.delete(plugin.id)
    context.window.contentView.removeChildView(view)
    if (!view.webContents.isDestroyed()) {
      view.webContents.close()
    }
  }
  public initDialogView() {}
  public showDialogView() {}
  public hideDialogView() {}
  public closeDialogView() {}
}
