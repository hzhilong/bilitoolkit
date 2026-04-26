import type { TaskPluginInfo, Task } from '@/shared/types/task.ts'
import type { TaskUpdate } from '@/main/db/schema.ts'
import type { TaskSchedule } from 'bilitoolkit-types'

export type TaskModalProps =
  | {
      type: 'add'
      plugin: TaskPluginInfo
      task?: never
      title?: string
    }
  | {
      type: 'update'
      plugin: TaskPluginInfo
      task: Task
      title?: string
    }

export const defaultSchedule = {
  type: 'cron',
  value: '',
} as TaskSchedule

export type CreateTaskPayload = Omit<Task, 'id' | 'createdAt'>
export type UpdateTaskPayload = Pick<Task, 'id'> & TaskUpdate

export type TaskSubmitPayload = { type: 'add'; data: CreateTaskPayload } | { type: 'update'; data: UpdateTaskPayload }
