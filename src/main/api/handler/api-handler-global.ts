import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import { generateId } from '@/main/utils/id.js'
import type { WebContents } from 'electron'
import { ipcMain } from 'electron'
import type { IpcRequestBody, IpcResponseBody } from '@/main/types/ipc-request.js'
import type { ApiCallerContext, IpcToolkitGlobalApi } from '@/main/types/ipc-toolkit-api.js'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import type { BaseWindowManager } from '@/main/window/base-window-manager.js'
import { unwrapBizResult } from '@ybgnb/utils'

type IpcMainEvent = Electron.IpcMainEvent

/**
 * 响应数据监听
 */
export type ResponseListener = (event: IpcMainEvent, rep: IpcResponseBody) => void

export const _getGlobalData = (
  targetWebContents: WebContents,
  globalDataKey: string,
  timeout: boolean = true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => {
  return new Promise((resolve, reject) => {
    // 生成唯一请求 ID
    const requestId = generateId()
    // 监听响应事件，匹配请求 ID
    let isFinish = false
    const responseListener: ResponseListener = (event: IpcMainEvent, rep: IpcResponseBody) => {
      if (rep.reqId === requestId) {
        ipcMain.removeListener(IPC_CHANNELS.RESPONSE_DATA, responseListener) // 清理监听器
        isFinish = true
        // 解包BizResult
        unwrapBizResult(rep.data).then(resolve).catch(reject)
      }
    }
    ipcMain.on(IPC_CHANNELS.RESPONSE_DATA, responseListener)

    // 发送获取数据的请求，附带请求 ID
    const requestBody = {
      reqId: requestId,
      name: globalDataKey,
      args: args,
    } satisfies IpcRequestBody

    targetWebContents.send(IPC_CHANNELS.REQUEST_DATA, requestBody)

    // 超时处理
    if (timeout) {
      setTimeout(() => {
        if (!isFinish) {
          ipcMain.removeListener(IPC_CHANNELS.RESPONSE_DATA, responseListener)
          reject(new Error(`获取数据[${globalDataKey}]超时`))
        }
      }, 5000)
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HostArgs = [targetEnvType: 'host', targetDataName: string, timeout: boolean, ...args: any[]]
type PluginArgs = [
  targetEnvType: 'plugin',
  targetPluginId: string,
  targetDataName: string,
  timeout: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[],
]

/**
 * 全局数据 API 处理器
 */
export class GlobalApiHandler extends ApiHandleStrategy implements IpcToolkitGlobalApi {
  private windowManage: BaseWindowManager

  constructor(wm: BaseWindowManager) {
    super()
    this.windowManage = wm
  }

  async getGlobalData(context: ApiCallerContext, ...fnArgs: HostArgs | PluginArgs): Promise<unknown> {
    let targetWebContents: WebContents,
      targetPluginId: string,
      targetDataName: string,
      timeout: boolean,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args: any[]
    if (fnArgs[0] === 'host') {
      ;[, targetDataName, timeout, ...args] = fnArgs
      targetWebContents = this.windowManage.getHostWebContents()
      // 回调给宿主环境时追加调用者的上下文
      args = [this.toApiCallerIdentity(context), ...args]
    } else {
      ;[, targetPluginId, targetDataName, timeout, ...args] = fnArgs
      targetWebContents = this.windowManage.getPluginWebContents(targetPluginId)
    }
    return _getGlobalData(targetWebContents, targetDataName, timeout, ...args)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getData(context: ApiCallerContext, name: string, timeout: boolean, ...args: any[]): Promise<unknown> {
    return this.getGlobalData(context, 'host', name, timeout, ...args)
  }

  getPluginData(
    context: ApiCallerContext,
    pluginId: string,
    name: string,
    timeout: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): Promise<unknown> {
    return this.getGlobalData(context, 'plugin', pluginId, name, timeout, ...args)
  }
}
