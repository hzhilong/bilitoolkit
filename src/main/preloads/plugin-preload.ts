// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。

import { contextBridge } from 'electron'
import { exposeToolkitApi } from '@/main/api/invoke/invoke-api'
import { loadPluginMetadata } from '@/main/preloads/plugin-meta.ts'

// 读取主进程注入的数据
loadPluginMetadata()

/**
 * 公用的preload.ts
 */
// 初始化preload脚本，暴露IPC相关API给渲染进程
contextBridge.exposeInMainWorld('toolkitApi', exposeToolkitApi)
