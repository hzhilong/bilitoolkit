import { BizResult, CommonError } from '@ybgnb/utils';
import { ipcRenderer } from 'electron';
import { cloneDeep } from 'lodash';
import type { ToolkitApiModule } from '@/shared/types/toolkit-core-api.ts'
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'
import type { PluginApiInvokeOptions } from '@/shared/types/api-invoke.ts'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.ts'

/**
 * 调用API
 * @param module api模块
 * @param name  api方法
 * @param args  方法参数
 */
export async function invokeApi<A, T = void>(
  module: ToolkitApiModule,
  name: LeafFunctionPaths<A> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> {
  const options: PluginApiInvokeOptions = { module, name, args: cloneDeep(args) }
  // 当作前后端通信就行，后端只能传序列化的数据，所有异步任务的结果需要包装成BuResult，获取后再解包成Promise
  const result = (await ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_APIS, options)) as BizResult<T>
  if (result.success) {
    return result.data as T
  } else {
    throw new CommonError(result.msg)
  }
}
