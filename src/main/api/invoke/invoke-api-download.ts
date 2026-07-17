import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import type { ToolkitDownloadApi, DownloadTask } from 'bilitoolkit-types'

export const downloadApi = {
  async onUpdated(callback: (task: DownloadTask) => void) {
    ipcRenderer.on(IPC_CHANNELS.DOWNLOAD_TASK_UPDATE, (_event: Electron.IpcRendererEvent, task: DownloadTask) => {
      callback(task)
    })
  },
} satisfies Partial<ToolkitDownloadApi> as ToolkitDownloadApi
