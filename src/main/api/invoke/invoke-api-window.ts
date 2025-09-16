import { invokeApi } from './base-invoke';
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'
import type { ToolkitWindowApi } from 'bilitoolkit-api-types'

export const invokeWindowApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitWindowApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeApi<ToolkitWindowApi, T>('window', name, ...args)
}

export const windowApi: ToolkitWindowApi = {
  close(): Promise<void> {
    return invokeWindowApi('close')
  },
  maximize(max: boolean): Promise<void> {
    return invokeWindowApi('maximize', max)
  },
  minimize(): Promise<void> {
    return invokeWindowApi('minimize')
  },
}
