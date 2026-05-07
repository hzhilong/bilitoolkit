// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。

import { contextBridge } from 'electron'
import { loadPluginMetadata } from '@/main/preloads/plugin-meta.js'
import { EXPOSE_KEYS } from '@/shared/types/expose-keys.js'
import { exposeToolkitApi, baseToolkitInvoke } from '@/main/api/invoke/invoke-api.js'

// 读取主进程注入的数据
loadPluginMetadata()

/**
 * 公用的preload.ts
 */
// 初始化preload脚本，暴露IPC相关API给渲染进程
contextBridge.exposeInMainWorld(EXPOSE_KEYS.__toolkitInvoke, baseToolkitInvoke)
contextBridge.exposeInMainWorld(EXPOSE_KEYS.__toolkitApi, exposeToolkitApi)
