import { invokeApi } from './base-invoke';
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'
import type { ToolkitDBApi } from 'bilitoolkit-api-types'

export const invokeDBApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitDBApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeApi<ToolkitDBApi, T>('db', name, ...args)
}

export const db: ToolkitDBApi = {
  init(id: string, defaultData: object): Promise<object> {
    return invokeDBApi('init', id, defaultData)
  },
  bulkDelete(idPrefix: string | undefined): Promise<string[]> {
    return invokeDBApi('bulkDelete', idPrefix)
  },
  bulkRead(idPrefix: string | undefined): Promise<object[]> {
    return invokeDBApi('bulkRead', idPrefix)
  },
  bulkWrite(docs: { id: string; data: object }[]): Promise<void> {
    return invokeDBApi('bulkWrite', docs)
  },
  delete(id: string): Promise<void> {
    return invokeDBApi('delete', id)
  },
  has(id: string): Promise<boolean> {
    return invokeDBApi('has', id)
  },
  read(id: string): Promise<object> {
    return invokeDBApi('read', id)
  },
  write(id: string, data: object): Promise<void> {
    return invokeDBApi('write', id, data)
  },
}
