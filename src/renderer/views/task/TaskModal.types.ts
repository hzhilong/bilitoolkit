import type { TaskPluginInfo, Task, TaskUpdate } from '@/shared/types/task.js'
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
