import {
  type DownloadTask,
  type DownloadTaskProgress,
  type DownloadResourceType,
  type DownloadTaskStatus,
  type DownloadResource,
} from 'bilitoolkit-types'
import type { UserCookie } from '@ybgnb/bili-api'

export type DownloadProgress = Pick<DownloadTaskProgress, 'totalBytes' | 'completedBytes' | 'speedKBps'>

export interface DownloaderListener {
  onStatusUpdate(status: DownloadTaskStatus, error?: string): void
  onProgressUpdate(update: DownloadProgress): void
}

export type DownloaderContext<Type extends DownloadResourceType> = DownloadResource & {
  type: Type
  listener: DownloaderListener
  userCookie: UserCookie
  absoluteFilePath: string
  completedBytes?: number
}

export interface RunnerListener {
  onTaskUpdate(id: DownloadTask['id'], update: Partial<Omit<DownloadTask, 'id'>>): void
}

export type RunnerContext = {
  task: DownloadTask
  listener: RunnerListener
  fileRoot: string
}
