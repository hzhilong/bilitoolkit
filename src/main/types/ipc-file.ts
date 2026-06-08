import type { FileHandle } from 'bilitoolkit-types'

export type FileHandleId = string

export type FileOperation = keyof FileHandle | 'open'

export interface IpcFileTrigger {
  handleId: FileHandleId
}

export interface IpcFilePayload {
  operation: FileOperation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[]
}
