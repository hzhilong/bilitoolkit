import { invokeApi } from './base-invoke'
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'
import type { ToolkitAccountApi, BiliAccount } from 'bilitoolkit-api-types'

export const invokeAccountApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitAccountApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeApi<ToolkitAccountApi, T>('account', name, ...args)
}

export const accountApi: ToolkitAccountApi = {
  chooseAccount: function () {
    return invokeAccountApi('chooseAccount')
  },
  requestAccountAuth(uid: number): Promise<BiliAccount> {
    return invokeAccountApi('requestAccountAuth', uid)
  },
}
