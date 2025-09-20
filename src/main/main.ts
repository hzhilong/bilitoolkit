// https://www.electronjs.org/zh/docs/latest/tutorial/quick-start
// app 控制应用程序的事件生命周期（相当于应用程序）
// BrowserWindow 创建并控制浏览器窗口（相当于打开桌面弹框）
import { app, BrowserWindow } from 'electron'
import * as os from 'node:os'
import { windowManager } from '@/main/window/window-manager.ts'
import { appPath } from '@/main/common/app-path.ts'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
app.commandLine.appendSwitch('disable-web-security')

// 主窗口
let mainWindow: BrowserWindow | null = null

// 禁用 Windows 7 的 GPU 加速
if (os.release().startsWith('6.1')) {
  app.disableHardwareAcceleration()
}

// 设置 Windows 10+ 通知的应用程序名称
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

// 创建窗口 https://www.electronjs.org/zh/docs/latest/api/browser-window
const createWindow = () => {
  mainWindow = windowManager.createWindow(
    {
      width: 1000,
      height: 700,
      minWidth: 1000,
      minHeight: 700,
      webPreferences: {
        preload: appPath.preloadJS,
      },
    },
    { show: true },
  )

  // 初始化主窗口相关的 IPC 事件监听和处理
  windowManager.initMainWindow(mainWindow)

  if (appPath.devUrl) {
    // 开发
    mainWindow.loadURL(appPath.devUrl).then(() => {})
  } else {
    // 生产
    mainWindow.loadFile(appPath.appURL).then(() => {})
  }
}

// 这段程序将会在 Electron 结束初始化和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow()
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常对应用程序和它们的菜单栏来说应该时刻保持激活状态,
// 直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
  mainWindow = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  // 在 macOS 系统内, 如果没有已开启的应用窗口
  // 点击托盘图标时通常会重新创建一个新窗口
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
