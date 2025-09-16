import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { CommonError } from '@ybgnb/utils'
import type { WindowManager } from '@/main/window/window-manager.ts'
import { type HostEventChannel, HostEventChannels } from '@/shared/types/host-event-channel.ts'
import type { IpcEventEmiter } from '@/main/types/ipc-event.ts'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.ts'
import type { ApiCallerContext, IpcToolkitEventApi } from '@/main/types/ipc-toolkit-api.ts'

/**
 * 发射事件
 */
export const emit = (
  wm: WindowManager,
  channel: HostEventChannel | string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...data: any[]
) => {
  const emitter: IpcEventEmiter = {
    channel: channel,
    payload: data,
  }

  const webContents = wm.webContentsToWindowMap.keys()
  for (const web of webContents) {
    web.send(IPC_CHANNELS.TOOLKIT_EVENT, emitter)
  }
}

/**
 * 事件 API 处理器
 */
export class EventApiHandler extends ApiHandleStrategy implements Pick<IpcToolkitEventApi, 'emit'> {
  private readonly windowManage: WindowManager

  constructor(wm: WindowManager) {
    super()
    this.windowManage = wm
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async emit(context: ApiCallerContext, eventName: string, ...data: any[]): Promise<void> {
    if (context.envType !== 'host' && HostEventChannels.includes(eventName as HostEventChannel)) {
      throw new CommonError(`内部错误，插件不能注册[${eventName}]事件`)
    }
    emit(this.windowManage, eventName, ...data)
  }
}
