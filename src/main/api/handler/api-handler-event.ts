import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import { HOST_EVENT_CHANNELS, type HostEventChannel } from '@/shared/types/host-event-channel.js'
import type { IpcEventEmiter } from '@/main/types/ipc-event.js'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import type { ApiCallerContext, IpcToolkitEventApi } from '@/main/types/ipc-toolkit-api.js'
import { webContents } from 'electron'
import { eventBus } from '@/main/event/event-bus.js'
import { windowManager } from '@/main/window/window-manager.js'

/**
 * 发射事件
 */
export const emit = (
  currWebContentsId: number | null,
  channel: HostEventChannel | string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...data: any[]
) => {
  const emitter: IpcEventEmiter = {
    channel: channel,
    payload: data,
  }

  // 发送给主进程的内部监听器
  eventBus.emit(channel, ...data)

  // 发送给渲染进程
  const all = webContents.getAllWebContents()
  for (const wc of all) {
    if (wc.id !== currWebContentsId) {
      // 相同渲染环境不转发
      wc.send(IPC_CHANNELS.TOOLKIT_EVENT, emitter)
    }
  }
}

export const emitHost = (
  channel: HostEventChannel | string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...data: any[]
) => {
  const emitter: IpcEventEmiter = {
    channel: channel,
    payload: data,
  }

  // 发送给主进程的内部监听器
  eventBus.emit(channel, ...data)

  // 发送给渲染进程
  windowManager.getHostWebContents().send(IPC_CHANNELS.TOOLKIT_EVENT, emitter)
}

/**
 * 事件 API 处理器
 */
export class EventApiHandler extends ApiHandleStrategy implements Pick<IpcToolkitEventApi, 'emit'> {
  constructor() {
    super()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async emit(context: ApiCallerContext, eventName: string, ...data: any[]): Promise<void> {
    if (context.envType !== 'host' && eventName in HOST_EVENT_CHANNELS) {
      throw new Error(`内部错误，插件不能注册[${eventName}]事件`)
    }
    emit(context.webContents.id, eventName, ...data)
  }
}
