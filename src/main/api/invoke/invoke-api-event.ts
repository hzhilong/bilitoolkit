import { invokeApi } from './base-invoke'
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'
import type { AppThemeState, ToolkitEventApi, BiliAccountInfo } from 'bilitoolkit-api-types'
import type { EventListener, IpcEventEmiter } from '@/main/types/ipc-event.ts'
import { HOST_EVENT_CHANNELS, type HostEventChannel } from '@/shared/types/host-event-channel.ts'
import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.ts'
type IpcRendererEvent = Electron.IpcRendererEvent

export const invokeEventApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitEventApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeApi<ToolkitEventApi, T>('event', name, ...args)
}

/**
 * 监听事件
 */
export const listenEvent = async (channel: HostEventChannel | string, listener: EventListener) => {
  // 监听主进程的请求
  ipcRenderer.on(IPC_CHANNELS.TOOLKIT_EVENT, async (event: IpcRendererEvent, emitter: IpcEventEmiter) => {
    if (channel === emitter.channel) {
      listener(...emitter.payload)
    }
  })
}
/**
 * 监听宿主环境的事件
 */
export const listenHostEvent = async (channel: HostEventChannel, listener: EventListener) => {
  return listenEvent(channel, listener)
}

export const eventApi: ToolkitEventApi = {
  onUpdateAppTheme: function (listener: (theme: AppThemeState) => void): Promise<void> {
    return listenHostEvent('UPDATE_APP_THEME', listener)
  },
  onAccountLogout: function (listener: (account: BiliAccountInfo) => void): Promise<void> {
    return listenHostEvent('ACCOUNT_LOGOUT', listener)
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: function (eventName: string, listener: (...data: any[]) => void): Promise<void> {
    return listenEvent(eventName, listener)
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit: function (eventName: string, ...data: any[]): Promise<void> {
    return invokeEventApi('emit', eventName, ...data)
  },
  onWindowShown: function (listener: () => void): Promise<void> {
    return listenHostEvent(HOST_EVENT_CHANNELS.WINDOW_SHOWN, listener)
  },
}
