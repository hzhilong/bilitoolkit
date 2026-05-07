/* eslint-disable @typescript-eslint/no-explicit-any */
import { BizResult } from '@ybgnb/utils'
import { ipcRenderer } from 'electron'
import type { ToolkitApiModule, ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.js'
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.js'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import type { PluginApiInvokeOptions } from '@/shared/types/api-invoke.js'

/**
 * 基础的调用API方法
 * @param apiPath api路径
 * @param args  方法参数
 */
export async function baseInvokeApi<T>(apiPath: string, ...args: any[]): Promise<T> {
  const [module, name] = apiPath.split('.')
  const options: PluginApiInvokeOptions = { module: module as keyof ToolkitApiWithCore, name, args: args }
  // 当作前后端通信就行，后端只能传序列化的数据，所有异步任务的结果需要包装成BuResult，获取后再解包成Promise
  const result = (await ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_APIS, options)) as BizResult<T>
  if (result.success) {
    return result.data as T
  } else {
    throw new Error(result.msg)
  }
}

/**
 * 调用模块API
 * @param module api模块
 * @param name  api方法
 * @param args  方法参数
 */
export async function invokeModuleApi<A, T = void>(
  module: ToolkitApiModule,
  name: LeafFunctionPaths<A> & string,
  ...args: any[]
): Promise<T> {
  const options: PluginApiInvokeOptions = { module, name, args: args }
  // 当作前后端通信就行，后端只能传序列化的数据，所有异步任务的结果需要包装成BuResult，获取后再解包成Promise
  const result = (await ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_APIS, options)) as BizResult<T>
  if (result.success) {
    return result.data as T
  } else {
    throw new Error(result.msg)
  }
}
