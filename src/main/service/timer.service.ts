import type { TimerOptions } from 'bilitoolkit-types'
import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.js'
import { ipcMain, type IpcMainEvent } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import type { IpcTimerTrigger } from '@/main/types/ipc-timer.js'

type CancelTimer = () => Promise<void>

export class TimerService {
  // 已注册定时器的句柄映射（定时器 ID -> 取消方法）
  private readonly timerHandles = new Map<string, CancelTimer>()

  public async register(context: ApiCallerContext, options: TimerOptions): Promise<void> {
    const { timerId, type, duration } = options
    if (this.timerHandles.has(timerId)) throw new Error(`定时器[${timerId}]已存在`)

    const currTrigger: IpcTimerTrigger = {
      timerId: timerId,
    }
    const onAck = async (event: IpcMainEvent, trigger: IpcTimerTrigger, ack: boolean) => {
      if (trigger.timerId === timerId && !ack) {
        await this.cancel(context, timerId)
      }
    }
    const onTrigger = async () => {
      context.webContents.send(IPC_CHANNELS.TRIGGER_TIMER, currTrigger)
    }
    ipcMain.on(IPC_CHANNELS.TRIGGER_TIMER_ACK, onAck)
    const timeout = type === 'delay' ? setTimeout(onTrigger, duration) : setInterval(onTrigger, duration)
    const cancel = async () => {
      ipcMain.removeListener(IPC_CHANNELS.TRIGGER_TIMER, onAck)
      if (type === 'delay') {
        clearTimeout(timeout)
      } else {
        clearInterval(timeout)
      }
    }
    this.timerHandles.set(timerId, cancel)
  }

  public async cancel(context: ApiCallerContext, timerId: string): Promise<void> {
    if (!this.timerHandles.has(timerId)) return

    const cancelTimer = this.timerHandles.get(timerId)
    this.timerHandles.delete(timerId)
    if (cancelTimer) {
      await cancelTimer()
    }
    const currTrigger: IpcTimerTrigger = {
      timerId: timerId,
    }
    context.webContents.send(IPC_CHANNELS.CANCEL_TIMER, currTrigger)
  }
}

export const timerService = new TimerService()
