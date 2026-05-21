import type {
  TaskPluginInfo,
  Task,
  TaskExecution,
  TaskExecutionFilters,
  TaskExecutionLog,
  TaskWithPlugin,
  TaskDispatchResult,
  TaskUpdate,
} from '@/shared/types/task.js'
import type { PageResult, PageParams } from 'bilitoolkit-ui'

/**
 * 任务相关的API
 */
export interface ToolkitTaskApi {
  /**
   * 获取任务插件的信息
   */
  getTaskPluginInfo(pluginId: string): Promise<TaskPluginInfo>

  /**
   * 通过任务列表
   */
  getTaskList(pluginId?: string): Promise<Task[]>

  /**
   * 获取所有的任务列表，并且关联插件数据
   */
  getTaskListWithPlugin(): Promise<TaskWithPlugin[]>

  /**
   * 获取任务执行记录的分页数据
   */
  getTaskExecutionsByPage(pageParams: PageParams, filters: TaskExecutionFilters): Promise<PageResult<TaskExecution>>

  /**
   * 获取任务执行记录的日志
   */
  getTaskExecutionLogs(taskExecutionId: number): Promise<TaskExecutionLog[]>

  /**
   * 插件任务
   */
  createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task>

  /**
   * 更新任务
   */
  updateTask(data: Pick<Task, 'id'> & TaskUpdate): Promise<Task>

  /**
   * 删除任务
   */
  deleteTask(id: number): Promise<void>

  /**
   * 执行任务
   */
  executeTask(task: Task): Promise<TaskDispatchResult>

  /**
   * 取消任务执行
   */
  abortTaskExecution(taskExecutionId: number | TaskExecution): Promise<boolean>
}
