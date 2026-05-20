/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TaskExecution, NewTaskExecutionLog } from '@/shared/types/task.js'
import type { ConsoleMethod } from '@ybgnb/bili-api'
import { emit } from '@/main/api/handler/api-handler-event.js'
import { HOST_EVENT_CHANNELS } from '@/shared/types/host-event-channel.js'
import type { TaskLogger } from 'bilitoolkit-types'
import * as util from 'node:util'
import { taskRepo } from '@/main/db/repository/task.js'
import { getPluginLogger } from '@/main/common/main-logger.js'

function formatLogMessage(...data: Parameters<ConsoleMethod>): string {
  return data
    .map((arg) => (typeof arg === 'string' ? arg : util.inspect(arg, { depth: null, colors: false })))
    .join(' ')
}

export function buildLogger(pluginId: string, taskExecution: TaskExecution) {
  const logger: any = {}
  const fnList = ['debug', 'info', 'warn', 'error']
  for (const fn of fnList) {
    logger[fn] = (...data: Parameters<ConsoleMethod>) => {
      // 主进程记录任务日志
      ;(getPluginLogger(pluginId) as any)[fn](`[task ${taskExecution.taskId}]`, ...data)
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
