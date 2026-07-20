import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import type { ToolkitDownloadApi, DownloadTask } from 'bilitoolkit-types'

export const downloadApi = {
  async onUpdated(callback: (task: DownloadTask) => void) {
    const listener = (_event: Electron.IpcRendererEvent, task: DownloadTask) => {
      callback(task)
    }
    ipcRenderer.on(IPC_CHANNELS.DOWNLOAD_TASK_UPDATE, listener)
    const cancel = () => {
      ipcRenderer.off(IPC_CHANNELS.DOWNLOAD_TASK_UPDATE, listener)
    }
    return cancel
  },
} satisfies Partial<ToolkitDownloadApi> as ToolkitDownloadApi
