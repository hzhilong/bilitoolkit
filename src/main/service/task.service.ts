import type {
  TaskId,
  Task,
  TaskWithPlugin,
  TaskExecutionLog,
  TaskExecutionFilters,
  TaskTrigger,
  TaskExecution,
  TaskExecutionId,
  CreateTaskInput,
  NewTask,
  TaskUpdate,
} from '@/shared/types/task.js'
import { taskRepo } from '@/main/db/repository/task.js'
import { pluginManager } from '@/main/plugin/manager.js'
import { BaseService } from '@/main/service/base.service.js'
import type { TaskResult } from 'bilitoolkit-types'
import type { PageResult, PageParams } from 'bilitoolkit-ui'

/**
 * task 相关的数据操作服务，并持有执行态索引
 *
 * @description API接口处理器只能调用该服务的数据获取方法，涉及任务的创建/修改/删除/执行/取消 等操作，请调用 TaskRuntime
 */
export class TaskService extends BaseService {
  /**
   * 执行记录 ID -> AbortController
   * 用于取消正在执行中的任务
   */
  private readonly abortControllers = new Map<TaskExecutionId, AbortController>()

  /**
   * 任务 ID -> 当前正在运行的执行记录 ID
   * 用于判断同一个任务是否已经在跑
   */
  private readonly runningExecutionByTaskId = new Map<TaskId, TaskExecutionId>()

  /**
   * 执行记录 ID -> 所属任务 ID
   * 用于在执行结束后清理运行态索引
   */
  private readonly taskIdByExecutionId = new Map<TaskExecutionId, TaskId>()

  async getTaskList(pluginId?: string): Promise<Task[]> {
    return await taskRepo.getTasks(pluginId)
  }

  /**
   * 获取所有的任务列表，并且关联插件数据
   */
  async getTaskListWithPlugin(): Promise<TaskWithPlugin[]> {
    const tasks = await taskRepo.getTasks()
    return tasks.map((task) => {
      try {
        return { ...task, plugin: pluginManager.getInstalledPlugin(task.pluginId) }
      } catch {
        return task
      }
    })
  }

  /**
   * 获取执行记录的分页数据
   */
  async fetchExecutionsPage(pageParams: PageParams, filters: TaskExecutionFilters): Promise<PageResult<TaskExecution>> {
    return taskRepo.fetchExecutionsPage(pageParams, filters)
  }

  /**
   * 获取日志列表
   */
  async getLogList(taskExecutionId: number): Promise<TaskExecutionLog[]> {
    return await taskRepo.getLogs(taskExecutionId)
  }

  async getTaskById(taskId: TaskId): Promise<Task | undefined> {
    return taskRepo.getTaskById(taskId)
  }

  async getEnabledTasks(pluginId?: string): Promise<Task[]> {
    return taskRepo.getEnabledTasks(pluginId)
  }

  /**
   * 创建任务
   */
  async createTask(task: CreateTaskInput): Promise<Task> {
    const newTask: NewTask = {
      ...task,
      createdAt: Date.now(),
    }
    const result = await taskRepo.addTask(newTask)
    const newData = await taskRepo.getTaskById(this.getInsertId(result))
    if (!newData) {
      throw new Error('添加失败')
    }
    return newData
  }

  /**
   * 更新任务
   */
  async updateTask(task: Pick<Task, 'id'> & TaskUpdate) {
    await taskRepo.updateTask(task)
    return await taskRepo.getTaskById(task.id)
  }

  /**
   * 删除任务及其关联数据
   */
  async deleteTaskCascade(taskId: TaskId): Promise<void> {
    await taskRepo.deleteTaskCascade(taskId)
  }

  /**
   * 获取任务执行记录
   */
  async getExecutionById(id: TaskExecutionId): Promise<TaskExecution | undefined> {
    return await taskRepo.getExecutionById(id)
  }

  /**
   * 开始执行一次任务（仅做数据操作）
   */
  async beginExecution({
    task,
    trigger,
    controller,
  }: {
    task: Task
    trigger: TaskTrigger
    controller: AbortController
  }): Promise<TaskExecution> {
    const startedAt = Date.now()

    const execution = await taskRepo.beginExecution(task, trigger, startedAt)

    this.abortControllers.set(execution.id, controller)
    this.runningExecutionByTaskId.set(execution.taskId, execution.id)
    this.taskIdByExecutionId.set(execution.id, execution.taskId)

    return execution
  }

  /**
   * 任务执行成功后处理（只是任务执行成功，并不是业务成功）
   */
  async finishExecutionSuccess(executionId: TaskExecutionId, result: TaskResult): Promise<TaskExecution> {
    const endedAt = Date.now()
    const execution = await taskRepo.finishExecution(executionId, {
      status: 'success',
      endedAt,
      result,
    })

    this.clearRuntimeState(executionId)
    return execution
  }

  /**
   * 任务执行失败后处理
   */
  async finishExecutionError(executionId: TaskExecutionId, errorMessage: string): Promise<TaskExecution> {
    const endedAt = Date.now()
    const execution = await taskRepo.finishExecution(executionId, {
      status: 'error',
      endedAt,
      result: {
        success: false,
        message: errorMessage,
      },
    })

    this.clearRuntimeState(executionId)
    return execution
  }

  /**
   * 任务执行被取消后处理
   */
  async finishExecutionCanceled(executionId: TaskExecutionId, errorMessage = '任务已取消'): Promise<TaskExecution> {
    const endedAt = Date.now()
    const execution = await taskRepo.finishExecution(executionId, {
      status: 'canceled',
      endedAt,
      result: {
        success: false,
        message: errorMessage,
      },
    })

    this.clearRuntimeState(executionId)
    return execution
  }

  /**
   * 某个任务是否正在运行
   */
  isTaskRunning(taskId: TaskId): boolean {
    return this.runningExecutionByTaskId.has(taskId)
  }

  /**
   * 获取某个任务当前运行中的执行记录 ID
   */
  getRunningExecutionId(taskId: TaskId): TaskExecutionId | undefined {
    return this.runningExecutionByTaskId.get(taskId)
  }

  /**
   * 获取某个执行记录对应的 AbortController
   */
  getAbortController(executionId: TaskExecutionId): AbortController | undefined {
    return this.abortControllers.get(executionId)
  }

  /**
   * 按执行记录取消
   */
  abortExecution(executionId: TaskExecutionId): boolean {
    const controller = this.abortControllers.get(executionId)
    if (!controller) return false

    controller.abort()
    return true
  }

  /**
   * 按任务取消
   */
  abortTask(taskId: TaskId): boolean {
    const executionId = this.runningExecutionByTaskId.get(taskId)
    if (!executionId) return false

    return this.abortExecution(executionId)
  }

  /**
   * 清理运行态索引
   */
  private clearRuntimeState(executionId: TaskExecutionId): void {
    const taskId = this.taskIdByExecutionId.get(executionId)

    this.abortControllers.delete(executionId)
    this.taskIdByExecutionId.delete(executionId)

    if (taskId !== undefined) {
      const current = this.runningExecutionByTaskId.get(taskId)
      if (current === executionId) {
        this.runningExecutionByTaskId.delete(taskId)
      }
    }
  }

  /**
   * 将所有正常运行的任务执行记录改成失败状态
   */
  failAllRunningExecutions() {
    return taskRepo.failAllRunningExecutions()
  }
}

export const taskService = new TaskService()
