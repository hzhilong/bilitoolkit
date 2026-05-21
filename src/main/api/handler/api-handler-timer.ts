import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import type { ApiCallerContext, IpcToolkitTimerApi } from '@/main/types/ipc-toolkit-api.js'
import type { TimerCallback, TimerOptions } from 'bilitoolkit-types'
import { timerService } from '@/main/service/timer.service.js'

/**
 * 定时器 API 处理器
 */
export class TimerApiHandler extends ApiHandleStrategy implements IpcToolkitTimerApi {
  constructor() {
    super()
  }

  cancel(context: ApiCallerContext, timerId: string): Promise<void> {
    return timerService.cancel(context, timerId)
  }

  register(context: ApiCallerContext, options: TimerOptions, _: TimerCallback): Promise<void> {
    return timerService.register(context, options)
  }
}
