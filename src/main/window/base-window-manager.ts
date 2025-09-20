import type { WebContents } from 'electron'
import { BrowserWindow, session, WebContentsView } from 'electron'
import type { CreateWindowOptions } from '@/main/types/create-window.ts'
import type { ApiCallerContext, HostApiCallerContext, PluginApiCallerContext } from '@/main/types/ipc-toolkit-api.ts'
import { isToolkitPlugin, type ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { CommonError } from '@ybgnb/utils'
import { getPluginDBPath } from '@/main/api/handler/api-handler-db.ts'
import { getPluginBaseFilePath } from '@/main/api/handler/api-handler-file.ts'
import path from 'path'
import { mainLogger } from '@/main/common/main-logger.ts'
import { appPath } from '@/main/common/app-path.ts'
import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.ts'
import { getGlobalData } from '@/main/api/handler/api-handler-global.ts'
import { defaultsDeep } from 'lodash'

type Rectangle = Electron.Rectangle

type IpcMainInvokeEvent = Electron.IpcMainInvokeEvent
type BrowserWindowConstructorOptions = Electron.BrowserWindowConstructorOptions

export abstract class BaseWindowManager {
  // 主窗口
  public mainWindow: BrowserWindow | null = null
  // 存储 所有插件WebContents 到 Plugin 的映射
  public readonly webContentsToPluginMap
  // 存储 所有插件WebContents 到 WebContentsView 的映射
  public readonly webContentsToViewMap
  public readonly pluginToViewMap
  private readonly pluginResizeListeners
  // app对话框窗口
  public appDialogWindow: BrowserWindow | undefined = undefined

  protected constructor() {
    this.webContentsToPluginMap = new Map<number, ToolkitPlugin>()
    this.webContentsToViewMap = new Map<number, WebContentsView>()
    this.pluginToViewMap = new Map<ToolkitPlugin, WebContentsView>()
    this.pluginResizeListeners = new Map<ToolkitPlugin, () => void>()
  }

  protected getMappingPlugin(sender: WebContents): ToolkitPlugin {
    const plugin = this.webContentsToPluginMap.get(sender.id)
    if (!plugin) throw new CommonError('内部错误，关联的插件为空')
    return plugin
  }

  protected getMappingView(sender: WebContents | ToolkitPlugin): WebContentsView {
    let view
    if (isToolkitPlugin(sender)) {
      view = this.pluginToViewMap.get(sender)
    } else {
      view = this.webContentsToViewMap.get(sender.id)
    }
    if (!view) throw new CommonError('内部错误，关联的视图为空')
    return view
  }

  protected isHost(sender: WebContents) {
    return sender.hostWebContents === null || sender.hostWebContents === undefined
  }

  /**
   * 获取API调用的上下文
   * @param event IpcMainInvokeEvent
   */
  public getApiCallerContext(event: IpcMainInvokeEvent): ApiCallerContext {
    const sender = event.sender
    const window = BrowserWindow.fromWebContents(sender)
    if (!window) {
      throw new CommonError('关联的窗口对象为空')
    }
    if (this.isHost(sender)) {
      // 宿主环境调用API
      return {
        envType: 'host',
        window: window,
        webContents: sender,
        dbPath: getPluginDBPath('host'),
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
        hostWebContents: sender.hostWebContents,
        dbPath: getPluginDBPath('plugin', plugin),
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
    context.window.close()
  }
  public async createPluginView(context: ApiCallerContext, plugin: ToolkitPlugin) {
    if (!this.isHost(context.webContents)) {
      throw new CommonError('非法调用')
    }
    const window = context.window
    mainLogger.log(`createPluginView`, plugin)
    try {
      const webView = this.getMappingView(plugin)
      if (webView) {
        mainLogger.log(`createPluginView 插件[${plugin.id}]已存在`)
        return webView
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (ignoredError) {}

    const ses = session.fromPartition('<' + plugin.id + '>')
    const preload = path.join(appPath.preloadsDir, `plugin-preload.js`)
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

    await view.webContents.loadURL(plugin.indexPath)

    this.webContentsToPluginMap.set(view.webContents.id, plugin)
    this.webContentsToViewMap.set(view.webContents.id, view)
    this.pluginToViewMap.set(plugin, view)
    this.pluginResizeListeners.set(plugin, updateBounds)
  }
  public showPluginView(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const contentView = context.window.contentView
    if (contentView.children && contentView.children.length > 0) {
      mainLogger.log(`showPluginView 当前${contentView.children.length}个子view`)
      contentView.children.forEach((c) => contentView.removeChildView(c))
    }
    contentView.addChildView(this.getMappingView(plugin))
  }
  public hidePluginView(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const view = this.pluginToViewMap.get(plugin)
    if (!view) {
      throw new CommonError('该插件未创建视图，关闭失败')
    }
    context.window.contentView.removeChildView(view)
  }
  public closePluginView(context: ApiCallerContext, plugin: ToolkitPlugin) {
    const view = this.pluginToViewMap.get(plugin)
    if (!view) {
      throw new CommonError('该插件未创建视图，关闭失败')
    }
    this.webContentsToPluginMap.delete(view.webContents.id)
    this.webContentsToViewMap.delete(view.webContents.id)
    this.pluginToViewMap.delete(plugin)
    this.pluginResizeListeners.delete(plugin)
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
