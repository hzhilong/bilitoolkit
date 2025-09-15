// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。

import { contextBridge } from 'electron'
import { WINDOW_APP_KEY, type WindowApp } from '@/shared/types/app-types.ts'

// 初始化宿主app的api暴露
export const initHostApp = (windowApp: WindowApp) => {
  // 暴露应用类型给渲染进程（宿主环境）
  contextBridge.exposeInMainWorld(WINDOW_APP_KEY, windowApp)

  // 暴露相关API给渲染进程（宿主环境）
  contextBridge.exposeInMainWorld('toolkitApi', {
    core: {
      openLogsFolder(){
        console.log('=============== openLogsFolder')
      }
    }
  })
}
