import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import type { ApiCallerContext, IpcToolkitTaskApi } from '@/main/types/ipc-toolkit-api.js'
import { pluginManager } from '@/main/plugin/manager.js'
import type {
  TaskPluginInfo,
  Task,
  TaskExecution,
  TaskExecutionLog,
  TaskExecutionFilters,
  TaskDispatchResult,
  TaskUpdate,
} from '@/shared/types/task.js'

import { taskService } from '@/main/service/task.service.js'
import { taskRuntime } from '@/main/plugin/task/runtime.js'
import type { PageResult, PageParams } from 'bilitoolkit-ui'
import { AppError } from 'bilitoolkit-types'

/**
 * 任务API处理器
 */
export class TaskApiHandler extends ApiHandleStrategy implements IpcToolkitTaskApi {
  constructor() {
    super()
  }

  async getTaskPluginInfo(context: ApiCallerContext, pluginId: string): Promise<TaskPluginInfo> {
    const plugin = pluginManager.getInstalledPlugin(pluginId)
    if (plugin.type !== 'task') throw new AppError('未找到该任务插件')
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
    pageParams: PageParams,
    filters: TaskExecutionFilters,
  ): Promise<PageResult<TaskExecution>> {
    return taskService.fetchExecutionsPage(pageParams, filters)
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
