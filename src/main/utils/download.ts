import type { DownloadRecord } from '@/main/types/download.js'
import { type DownloadTask } from 'bilitoolkit-types'

export const toDownloadTask = (record: DownloadRecord): DownloadTask => {
  const { pluginId: _, ...task } = record
  return task
}
