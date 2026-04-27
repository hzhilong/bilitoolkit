import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import type { ApiCallerContext, IpcToolkitTaskApi } from '@/main/types/ipc-toolkit-api.ts'
import { pluginManager } from '@/main/plugin/manager.ts'
import type {
  TaskPluginInfo,
  Task,
  TaskExecution,
  TaskExecutionLog,
  TaskExecutionFilters,
  TaskDispatchResult,
} from '@/shared/types/task.ts'

import type { PageResult } from '@/shared/types/page.ts'
import { types } from 'sass'
import type { TaskUpdate } from '@/main/db/schema.ts'
import Error = types.Error
import { taskService } from '@/main/service/task.service.ts'
import { taskRuntime } from '@/main/plugin/task/runtime.ts'

/**
 * 任务API处理器
 */
export class TaskApiHandler extends ApiHandleStrategy implements IpcToolkitTaskApi {
  constructor() {
    super()
  }

  async getTaskPluginInfo(context: ApiCallerContext, pluginId: string): Promise<TaskPluginInfo> {
    const plugin = pluginManager.getInstalledPlugin(pluginId)
    if (plugin.type !== 'task') throw new Error('未找到该任务插件')
    return plugin as TaskPluginInfo
  }

  async getTaskList(context: ApiCallerContext, pluginId?: string): Promise<Task[]> {
    return taskService.getTaskList(pluginId)
  }

  async getTaskListWithPlugin(_: ApiCallerContext): Promise<Task[]> {
    return taskService.getTaskListWithPlugin()
  }

  async getTaskExecutionsByPage(
    context: ApiCallerContext,
    filters: TaskExecutionFilters,
  ): Promise<PageResult<TaskExecution>> {
    return taskService.getExecutionListByPage(filters)
  }

  createTask(context: ApiCallerContext, task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    return taskRuntime.createTask(task)
  }

  updateTask(context: ApiCallerContext, data: Pick<Task, 'id'> & TaskUpdate): Promise<Task> {
    return taskRuntime.updateTask(data)
  }

  deleteTask(context: ApiCallerContext, id: number): Promise<void> {
    return taskRuntime.deleteTask(id)
  }

  executeTask(context: ApiCallerContext, task: Task): Promise<TaskDispatchResult> {
    return taskRuntime.executeTask(task.id, 'manual')
  }

  async getTaskExecutionLogs(context: ApiCallerContext, taskExecutionId: number): Promise<TaskExecutionLog[]> {
    return taskService.getLogList(taskExecutionId)
  }

  abortTaskExecution(context: ApiCallerContext, taskExecutionId: number | TaskExecution): Promise<boolean> {
    return taskRuntime.cancelTaskExecution(typeof taskExecutionId === 'number' ? taskExecutionId : taskExecutionId.id)
  }
}
