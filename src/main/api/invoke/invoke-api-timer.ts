import { invokeModuleApi } from './base-invoke.js'
import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import type { ToolkitTimerApi, TimerId, TimerCallback, TimerOptions } from 'bilitoolkit-types'
import type { IpcTimerTrigger } from '@/main/types/ipc-timer.js'
import { withTimeout } from '@ybgnb/utils'
type IpcRendererEvent = Electron.IpcRendererEvent

export const timerApi: ToolkitTimerApi = {
  async cancel(timerId: TimerId): Promise<void> {
    return await invokeModuleApi<ToolkitTimerApi>('event', 'cancel', timerId)
  },

  async register(options: TimerOptions, callback: TimerCallback): Promise<void> {
    const { timerId, type } = options
    const ackTimeout = options.ackTimeout ?? 500

    const onTrigger = async (event: IpcRendererEvent, trigger: IpcTimerTrigger) => {
      if (timerId === trigger.timerId) {
        try {
          // 通知渲染进程，并问询
          const ack = await withTimeout(callback.onTrigger(), ackTimeout)
          // 返回问询结果
          ipcRenderer.send(IPC_CHANNELS.TRIGGER_TIMER_ACK, trigger, ack)
        } catch {
          // 前端执行出错且未捕获处理
          ipcRenderer.send(IPC_CHANNELS.TRIGGER_TIMER_ACK, trigger, false)
        }
      }
    }
    // 监听主进程的定时器触发请求
    if (type === 'delay') {
      ipcRenderer.once(IPC_CHANNELS.TRIGGER_TIMER, onTrigger)
    } else {
      ipcRenderer.on(IPC_CHANNELS.TRIGGER_TIMER, onTrigger)
    }
    const onCancel = async (event: IpcRendererEvent, trigger: IpcTimerTrigger) => {
      if (timerId === trigger.timerId) {
        ipcRenderer.removeListener(IPC_CHANNELS.TRIGGER_TIMER, onTrigger)
      }
    }
    // 监听主进程中转的取消定时器请求
    ipcRenderer.once(IPC_CHANNELS.CANCEL_TIMER, onCancel)
    try {
      // 调用 IPC API 注册定时器
      await invokeModuleApi<ToolkitTimerApi>('event', 'register', options)
    } catch {
      // 注册失败，移除所有监听
      ipcRenderer.removeListener(IPC_CHANNELS.TRIGGER_TIMER, onTrigger)
      ipcRenderer.removeListener(IPC_CHANNELS.CANCEL_TIMER, onCancel)
    }
  },
}
