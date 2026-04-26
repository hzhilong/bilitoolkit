import type { Selectable, Generated } from 'kysely'
import type { Task, TaskExecution, TaskExecutionLog } from '@/shared/types/task.ts'

// 定义数据库结构
export interface TaskTable extends Omit<Task, 'id' | 'config' | 'schedule' | 'enabled'> {
  id: Generated<number>
  config: string | null
  schedule: string | null
  enabled: number
}

export interface TaskExecutionTable extends Omit<TaskExecution, 'id' | 'result'> {
  id: Generated<number>
  result: string | null
}

export interface TaskExecutionLogTable extends Omit<TaskExecutionLog, 'id'> {
  id: Generated<number>
}

export interface DatabaseSchema {
  tasks: TaskTable
  task_executions: TaskExecutionTable
  task_execution_logs: TaskExecutionLogTable
}

export type TableName = keyof DatabaseSchema

export type TableColumns<T extends keyof DatabaseSchema> = keyof DatabaseSchema[T]

// 导出辅助类型，方便在 Service 层使用
export type TaskRow = Selectable<TaskTable>
export type NewTask = Omit<Task, 'id'>
export type TaskUpdate = Omit<Task, 'pluginId' | 'createdAt'>

export type TaskExecutionRow = Selectable<TaskExecutionTable>
export type NewTaskExecution = Omit<TaskExecution, 'id'>
export type TaskExecutionUpdate = Omit<TaskExecution, 'taskId' | 'createdAt'>

export type TaskExecutionLogRow = Selectable<TaskExecutionLogTable>
export type NewTaskExecutionLog = Omit<TaskExecutionLog, 'id'>
