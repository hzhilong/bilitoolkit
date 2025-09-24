import { DevToolsType } from '@/shared/types/app-settings';
import { WebContentsView } from 'electron';
import { windowManager } from '@/main/window/window-manager.ts'
import { getAppSettings } from '@/main/utils/host-app-utils.ts'
import { CommonError } from '@ybgnb/utils'

// 打开开发者工具
export const showDevTools = () => {
  const type = getAppSettings().devToolsType
  const mainWeb = windowManager.mainWindow!.webContents
  const appDialog = windowManager.appDialogWindow
  const dialogWeb = appDialog?.webContents
  const [plugin] = windowManager.mainWindow?.contentView.children ?? []
  const pluginWeb = plugin ? (plugin as WebContentsView).webContents : undefined

  if (type === DevToolsType.MAIN) {
    // 主窗口
    mainWeb.openDevTools()
  } else if (type === DevToolsType.DIALOG) {
    // 全局对话框
    if(!dialogWeb){
      throw new CommonError('打开开发者工具失败：全局对话框未被创建')
    }else{
      dialogWeb.openDevTools()
    }
  } else if (type === DevToolsType.PLUGIN) {
    // 显示的插件
    if(!pluginWeb){
      throw new CommonError('打开开发者工具失败：当前未打开任何插件')
    }else{
      pluginWeb.openDevTools()
    }
  } else if (type === DevToolsType.AUTO) {
    if (dialogWeb && appDialog.isVisible()) {
      dialogWeb.openDevTools()
    } else if (pluginWeb) {
      pluginWeb.openDevTools()
    } else {
      mainWeb.openDevTools()
    }
  }
}
