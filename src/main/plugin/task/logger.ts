/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TaskExecution } from '@/shared/types/task.ts'
import type { ConsoleMethod } from '@ybgnb/bili-api'
import { mainTaskLogger } from '@/main/common/main-logger.ts'
import { emit } from '@/main/api/handler/api-handler-event.ts'
import { HOST_EVENT_CHANNELS } from '@/shared/types/host-event-channel.ts'
import type { TaskLogger } from 'bilitoolkit-types'
import * as util from 'node:util'
import type { NewTaskExecutionLog } from '@/main/db/schema.ts'
import { taskRepo } from '@/main/db/repository/task.ts'

function formatLogMessage(...data: Parameters<ConsoleMethod>): string {
  return data
    .map((arg) => (typeof arg === 'string' ? arg : util.inspect(arg, { depth: null, colors: false })))
    .join(' ')
}

export function buildLogger(taskExecution: TaskExecution) {
  const logger: any = {}
  const fnList = ['debug', 'info', 'warn', 'error']
  for (const fn of fnList) {
    logger[fn] = (...data: Parameters<ConsoleMethod>) => {
      // 主进程记录任务日志
      ;(mainTaskLogger as any)[fn](`[task ${taskExecution.taskId}]`, ...data)
      const log: NewTaskExecutionLog = {
        executionId: taskExecution.id,
        createdAt: Date.now(),
        level: fn as any,
        message: formatLogMessage(...data),
      }
      // 传递给渲染进程显示
      emit(null, HOST_EVENT_CHANNELS.TASK_PLUGIN_LOGGER, log, ...data)
      // 持久化
      taskRepo.addLog(log).then()
    }
  }
  return logger as TaskLogger
}
