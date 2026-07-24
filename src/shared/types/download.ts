import type { DownloadTask } from 'bilitoolkit-types'

export interface DownloadRecord extends DownloadTask {
  pluginId: string
}

export interface DownloadTaskChangePayload {
  type: 'create' | 'update' | 'remove'
  id: number
  task?: DownloadTask
}
