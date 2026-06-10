import { invokeModuleApi } from './base-invoke.js'
import type { BizResult } from '@ybgnb/utils'
import { cloneDeep } from 'lodash-es'
import type { ApiCallerEnvType, LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.js'
import type { ToolkitGlobalDataApi } from 'bilitoolkit-types'
import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import { type IpcRequestBody, toIpcResponseBody } from '@/main/types/ipc-request.js'

type IpcRendererEvent = Electron.IpcRendererEvent

export const invokeGlobalApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitGlobalDataApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeModuleApi<ToolkitGlobalDataApi, T>('global', name, ...args)
}

/**
 * 注册全局数据
 */
export const registerGlobalData = (
  envType: ApiCallerEnvType,
  dataName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFn: (...args: any[]) => Promise<BizResult<any>>,
) => {
  // 监听主进程的请求
  ipcRenderer.on(IPC_CHANNELS.REQUEST_DATA, async (event: IpcRendererEvent, requestBody: IpcRequestBody) => {
    if (dataName === requestBody.name) {
      // 回传给主进程
      if (requestBody.args) {
        const data = cloneDeep(await getFn(...requestBody.args))
        event.sender.send(IPC_CHANNELS.RESPONSE_DATA, toIpcResponseBody(requestBody, data))
      } else {
        const data = cloneDeep(await getFn())
        event.sender.send(IPC_CHANNELS.RESPONSE_DATA, toIpcResponseBody(requestBody, data))
      }
    }
  })
}

// 全局对象API
export const globalApi = (envType: ApiCallerEnvType) => {
  const globalApi: ToolkitGlobalDataApi = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getData(name: string, timeout: boolean, ...args: any[]): Promise<unknown> {
      return invokeGlobalApi('getData', name, timeout, ...args)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getPluginData(pluginId: string, name: string, timeout: boolean, ...args: any[]): Promise<unknown> {
      return invokeGlobalApi('getPluginData', pluginId, name, timeout, ...args)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async register(name: string, getFn: (...args: any[]) => Promise<BizResult<any>>): Promise<void> {
      return registerGlobalData(envType, name, getFn)
    },
  }
  return globalApi
}
