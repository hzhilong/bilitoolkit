// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。

import { contextBridge } from 'electron'
import { type WindowApp } from '@/shared/types/app-types.ts'
import { exposeHostToolkitApi } from '@/main/api/invoke/invoke-api.ts'
import { EXPOSE_KEYS } from '@/shared/types/expose-keys.ts'

// 初始化宿主app的api暴露
export const initApp = (windowApp: WindowApp) => {
  // 暴露应用类型给渲染进程（宿主环境）
  contextBridge.exposeInMainWorld(EXPOSE_KEYS._windowApp, windowApp)

  // 暴露相关API给渲染进程（宿主环境）
  contextBridge.exposeInMainWorld(EXPOSE_KEYS.toolkitApi, exposeHostToolkitApi)
}
