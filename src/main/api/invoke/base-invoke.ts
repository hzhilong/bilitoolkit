/* eslint-disable @typescript-eslint/no-explicit-any */
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
  // 当作前后端通信就行，后端只能传序列化的数据，所有异步任务的结果需要包装成 BizResult
  // ，渲染进程再解包成Promise。不要在preload解包，会丢失Error.name
  return await ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_APIS, options)
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
  // 当作前后端通信就行，后端只能传序列化的数据，所有异步任务的结果需要包装成 BizResult
  // ，渲染进程再解包成Promise。不要在preload解包，会丢失Error.name
  return await ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_APIS, options)
}
