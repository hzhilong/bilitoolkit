import { invokeApi } from './base-invoke'
import { BizResult } from '@ybgnb/utils'
import { cloneDeep } from 'lodash'
import type { ApiCallerEnvType, LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'
import type { ToolkitGlobalDataApi } from 'bilitoolkit-api-types'
import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.ts'
import { type IpcRequestBody, toIpcResponseBody } from '@/main/types/ipc-request.ts'
type IpcRendererEvent = Electron.IpcRendererEvent

export const invokeGlobalApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitGlobalDataApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeApi<ToolkitGlobalDataApi, T>('global', name, ...args)
}

/**
 * 注册全局数据
 */
export const registerGlobalData = (
  envType: ApiCallerEnvType,
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFn: (...args: any[]) => Promise<BizResult<any>>,
) => {
  const formatedName = `${envType}-${name}`
  // 监听主进程的请求
  ipcRenderer.on(IPC_CHANNELS.REQUEST_DATA, async (event: IpcRendererEvent, requestBody: IpcRequestBody) => {
    if (formatedName === requestBody.name) {
      // 回传给主进程
      if (requestBody.args) {
        event.sender.send(
          IPC_CHANNELS.RESPONSE_DATA,
          toIpcResponseBody(requestBody, cloneDeep(await getFn(...requestBody.args))),
        )
      } else {
        event.sender.send(IPC_CHANNELS.RESPONSE_DATA, toIpcResponseBody(requestBody, cloneDeep(await getFn())))
      }
    }
  })
}
// 全局对象API
export const globalApi: ToolkitGlobalDataApi = {
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
    return registerGlobalData('plugin', name, getFn)
  },
}

// 全局对象API（宿主环境特殊方法）
export const hostGlobalApi: Pick<ToolkitGlobalDataApi, 'register'> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async register(name: string, getFn: (...args: any[]) => Promise<BizResult<any>>): Promise<void> {
    return registerGlobalData('host', name, getFn)
  },
}
