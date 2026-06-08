import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import type { ToolkitFileApi, FileHandle, FileSeekWhence, FileStat, FileReadResult } from 'bilitoolkit-types'
import { type BizResult, unwrapBizResult } from '@ybgnb/utils'
import type { FileOperation, IpcFilePayload } from '@/main/types/ipc-file.js'

export const fileApi = {
  async open(filePath: string, flags?: string | number): Promise<FileHandle> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invokeIpc = async <T = any>(operation: FileOperation, ...args: any[]) => {
      return await unwrapBizResult(
        (await ipcRenderer.invoke(IPC_CHANNELS.FILE_HANDLE, {
          operation,
          args: args,
        } satisfies IpcFilePayload)) as BizResult<T>,
      )
    }

    const fileHandleId = await invokeIpc('open', filePath, flags)

    const fileHandle: FileHandle = {
      async close(): Promise<void> {
        await invokeIpc('close', fileHandleId)
      },
      async stat(): Promise<FileStat> {
        return await invokeIpc('stat', fileHandleId)
      },
      async write(data: Uint8Array): Promise<void> {
        return await invokeIpc('write', fileHandleId, data)
      },
      async flush(): Promise<void> {
        await invokeIpc('flush', fileHandleId)
      },
      async read(size?: number): Promise<FileReadResult> {
        return await invokeIpc('read', fileHandleId, size)
      },
      async seek(offset: number, whence?: FileSeekWhence): Promise<void> {
        return await invokeIpc('seek', fileHandleId, offset, whence)
      },
      async tell(): Promise<number> {
        return await invokeIpc('tell', fileHandleId)
      },
    }

    return fileHandle
  },
} satisfies Partial<ToolkitFileApi> as ToolkitFileApi
