/* eslint-disable @typescript-eslint/no-explicit-any */
import { BizResult, CommonError } from '@ybgnb/utils'
import { ipcRenderer } from 'electron'
import type { ToolkitApiModule, ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.ts'
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.ts'
import type { PluginApiInvokeOptions } from '@/shared/types/api-invoke.ts'

/**
 * 调用API
 * @param module api模块
 * @param name  api方法
 * @param args  方法参数
 */
export async function invokeApi<A, T = void>(
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
    throw new CommonError(result.msg)
  }
}

export function createApiProxy<TOverrides extends Record<string, any> = Record<string, any>>(
  module: keyof ToolkitApiWithCore & string,
  path: string[] = [],
  overrides?: Partial<TOverrides>,
): TOverrides {
  return new Proxy(() => {}, {
    get(_, key: unknown) {
      if (typeof key !== 'string') return undefined

      // 保护关键属性
      if (key === 'then' || key === '__proto__' || key === 'constructor') {
        return undefined
      }

      // 命中自定义方法（只在第一层或控制的层）
      if (!path.length && overrides && key in overrides) {
        return overrides[key]
      }

      return createApiProxy(module, [...path, key], overrides)
    },

    async apply(_, __, args: unknown[]) {
      const name = path.join('.')

      const result = await ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_APIS, { module, name, args })

      if (result?.success) return result.data
      throw new CommonError(result?.msg ?? 'API调用失败')
    },
  }) as any
}
