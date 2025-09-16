import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { IdUtils } from '@/main/utils/id-utils'
import { CommonError } from '@ybgnb/utils'
import { ipcMain } from 'electron'
import { cloneDeep } from 'lodash'
import type { IpcRequestBody, IpcResponseBody } from '@/main/types/ipc-request.ts'
import type { ApiCallerContext, ApiCallerEnvType, IpcToolkitGlobalApi } from '@/main/types/ipc-toolkit-api.ts'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.ts'
import WebContents = Electron.WebContents

type IpcMainEvent = Electron.IpcMainEvent

/**
 * 响应数据监听
 */
export type ResponseListener = (event: IpcMainEvent, rep: IpcResponseBody) => void

export const _getGlobalData = (
  webContents: WebContents,
  desEnvType: ApiCallerEnvType,
  name: string,
  timeout: boolean = true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => {
  return new Promise((resolve, reject) => {
    const formatedName = `${desEnvType}-${name}`
    // 生成唯一请求 ID
    const requestId = IdUtils.generateId()
    // 监听响应事件，匹配请求 ID
    let isFinish = false
    const responseListener: ResponseListener = (event: IpcMainEvent, rep: IpcResponseBody) => {
      if (rep.reqId === requestId) {
        ipcMain.removeListener(IPC_CHANNELS.RESPONSE_DATA, responseListener) // 清理监听器
        isFinish = true
        // 解包BizResult
        if (rep.data.success) {
          resolve(cloneDeep(rep.data.data))
        } else {
          reject(rep.data.msg)
        }
      }
    }
    ipcMain.on(IPC_CHANNELS.RESPONSE_DATA, responseListener)

    // 发送获取数据的请求，附带请求 ID
    const requestBody = {
      reqId: requestId,
      name: formatedName,
      args: args,
    } satisfies IpcRequestBody

    webContents.send(IPC_CHANNELS.REQUEST_DATA, requestBody)

    // 超时处理
    if (timeout) {
      setTimeout(() => {
        if (!isFinish) {
          ipcMain.removeListener(IPC_CHANNELS.RESPONSE_DATA, responseListener)
          reject(new CommonError(`获取数据[${name}]超时`))
        }
      }, 5000)
    }
  })
}

/**
 * 获取全局数据
 * @param context 调用方的上下文
 * @param desEnvType  数据所在的环境
 * @param name  数据名称
 * @param timeout 超时自动返回？
 * @param pluginId 插件id
 * @param args    参数
 * @private
 */
export const getGlobalData = async (
  context: ApiCallerContext,
  desEnvType: ApiCallerEnvType,
  name: string,
  timeout: boolean = true,
  pluginId: string | undefined = undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => {
  const webContents: WebContents = context.webContents
  const dataName = pluginId ? `${pluginId}-${name}` : name
  return await _getGlobalData(webContents, desEnvType, dataName, timeout, ...args)
}

/**
 * 全局数据 API 处理器
 */
export class GlobalApiHandler extends ApiHandleStrategy implements IpcToolkitGlobalApi {
  constructor() {
    super()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getData(context: ApiCallerContext, name: string, timeout: boolean, ...args: any[]): Promise<unknown> {
    return getGlobalData(context, 'host', name, timeout, undefined, ...args)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private __getHostData(context: ApiCallerContext, name: string, timeout: boolean = true, ...args: any[]) {
    return getGlobalData(context, 'host', name, timeout, undefined, ...args)
  }

  getPluginData(
    context: ApiCallerContext,
    pluginId: string,
    name: string,
    timeout: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): Promise<unknown> {
    return getGlobalData(context, 'plugin', name, timeout, pluginId, ...args)
  }
}
