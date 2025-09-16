import { invokeApi } from './base-invoke';
import type { ToolkitFileApi } from 'bilitoolkit-api-types'
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'

export const invokeFileApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitFileApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeApi<ToolkitFileApi, T>('file', name, ...args)
}

export const fileApi: ToolkitFileApi = {
  bulkDelete(filePaths: string[]): Promise<void> {
    return invokeFileApi('bulkDelete', filePaths)
  },
  delete(filePath: string): Promise<void> {
    return invokeFileApi('delete', filePath)
  },
  exists(filePath: string): Promise<boolean> {
    return invokeFileApi('exists', filePath)
  },
  read(filePath: string): Promise<Uint8Array> {
    return invokeFileApi('read', filePath)
  },
  write(filePath: string, content: Uint8Array): Promise<void> {
    return invokeFileApi('write', filePath, content)
  },
  writeChunk(filePath: string, content: Uint8Array, position?: number): Promise<void> {
    return invokeFileApi('writeChunk', filePath, content, position)
  },
}
