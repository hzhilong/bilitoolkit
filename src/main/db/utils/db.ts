import type { TaskRow, TaskExecutionRow } from '@/main/db/schema.js'
import type { Task, TaskExecution } from '@/shared/types/task.js'

/**
 * 将数据库行映射为业务 Task 对象
 */
export const mapRowToTask = (row: TaskRow): Task => {
  return {
    id: row.id,
    pluginId: row.pluginId,
    config: row.config ? JSON.parse(row.config) : undefined,
    schedule: row.schedule ? JSON.parse(row.schedule) : undefined,
    createdAt: row.createdAt,
    lastRunAt: row.lastRunAt,
    enabled: row.enabled !== 0,
  }
}

/**
 * 将数据库行映射为业务 TaskExecution 对象
 */
export const mapRowToExecution = (row: TaskExecutionRow): TaskExecution => {
  return {
    id: row.id,
    taskId: row.taskId,
    status: row.status,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    trigger: row.trigger,
    result: row.result ? JSON.parse(row.result) : '',
  }
}
