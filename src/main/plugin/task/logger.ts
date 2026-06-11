/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TaskExecution, NewTaskExecutionLog } from '@/shared/types/task.js'
import { emit } from '@/main/api/handler/api-handler-event.js'
import { HOST_EVENT_CHANNELS } from '@/shared/types/host-event-channel.js'
import * as util from 'node:util'
import { taskRepo } from '@/main/db/repository/task.js'
import { getPluginLogger } from '@/main/common/main-logger.js'
import { type Logger, createLogger } from '@ybgnb/utils'
import { getAppLogLevel } from '@/shared/common/app-log.js'

function formatLogMessage(...data: any[]): string {
  return data
    .map((arg) => (typeof arg === 'string' ? arg : util.inspect(arg, { depth: null, colors: false })))
    .join(' ')
}

export function buildLogger(pluginId: string, taskExecution: TaskExecution): Logger {
  return createLogger(getAppLogLevel(), (logLevel, ...data) => {
    // 主进程记录任务日志
    getPluginLogger(pluginId)[logLevel](`[task ${taskExecution.taskId}]`, ...data)
    const log: NewTaskExecutionLog = {
      executionId: taskExecution.id,
      createdAt: Date.now(),
      level: logLevel,
      message: formatLogMessage(...data),
    }
    // 传递给渲染进程显示
    emit(null, HOST_EVENT_CHANNELS.TASK_PLUGIN_LOGGER, log, ...data)
    // 持久化
    taskRepo.addLog(log).then()
  })
}
