import { invokeApi } from './base-invoke'
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'
import type { ToolkitDBApi } from 'bilitoolkit-api-types'

export const invokeDBApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitDBApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeApi<ToolkitDBApi, T>('db', name, ...args)
}

export const dbApi: ToolkitDBApi = {
  init<T extends object>(id: string, defaultData: T): Promise<T> {
    return invokeDBApi('init', id, defaultData)
  },
  bulkDelete(idPrefix: string | undefined): Promise<string[]> {
    return invokeDBApi('bulkDelete', idPrefix)
  },
  bulkRead<T extends object>(idPrefix: string | undefined): Promise<T[]> {
    return invokeDBApi('bulkRead', idPrefix)
  },
  bulkWrite<T extends object>(docs: { id: string; data: T }[]): Promise<void> {
    return invokeDBApi('bulkWrite', docs)
  },
  delete(id: string): Promise<void> {
    return invokeDBApi('delete', id)
  },
  has(id: string): Promise<boolean> {
    return invokeDBApi('has', id)
  },
  read<T extends object>(id: string): Promise<T> {
    return invokeDBApi('read', id)
  },
  write<T extends object>(id: string, data: T): Promise<void> {
    return invokeDBApi('write', id, data)
  },
}
