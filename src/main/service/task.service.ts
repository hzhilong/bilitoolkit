import { BaseService } from '@/main/service/base.service.ts'
import type {
  Task,
  TaskExecution,
  TaskExecutionFilters,
  TaskExecutionLog,
  TaskWithPlugin,
} from '@/shared/types/task.ts'
import { taskRepo } from '@/main/db/repository/task.ts'
import { taskExecutionRepo } from '@/main/db/repository/task-execution.ts'
import { AbortError, getErrorMessage } from '@ybgnb/utils'
import type { TaskUpdate, NewTask, NewTaskExecution } from '@/main/db/schema.ts'
import { taskPluginRunner } from '@/main/plugin/task/runner.ts'
import { mainLogger } from '@/main/common/main-logger.ts'
import type { PageResult } from '@/shared/types/page.ts'
import { taskExecutionLogRepo } from '@/main/db/repository/task-execution-log.ts'
import { pluginManager } from '@/main/plugin/manager.ts'

export class TaskService extends BaseService {
  // 维护执行中的取消信号，key为执行id
  private abortControllers = new Map<number, AbortController>()

  /**
   * 获取任务列表
   * @param pluginId
   */
  async getTaskList(pluginId?: string): Promise<Task[]> {
    return await taskRepo.getList(pluginId)
  }

  /**
   * 获取所有的任务列表，并且关联插件数据
   */
  async getTaskListWithPlugin(): Promise<TaskWithPlugin[]> {
    return (await taskRepo.getList()).map((task) => {
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
  async getExecutionListByPage(filters: TaskExecutionFilters): Promise<PageResult<TaskExecution>> {
    return taskExecutionRepo.getListByPage(filters)
  }

  /**
   * 获取日志列表
   */
  async getLogList(taskExecutionId: number): Promise<TaskExecutionLog[]> {
    return await taskExecutionLogRepo.getLogsByExecutionId(taskExecutionId)
  }

  /**
   * 创建任务
   */
  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const newTask: NewTask = {
      ...task,
      createdAt: Date.now(),
    }
    const result = await taskRepo.add(newTask)
    const newData = await taskRepo.getById(this.getInsertId(result))
    if (!newData) {
      throw new Error('添加失败')
    }
    return newData
  }

  /**
   * 更新任务
   */
  async updateTask(data: Pick<Task, 'id'> & TaskUpdate) {
    await taskRepo.update(data)
  }

  /**
   * 删除任务
   */
  async deleteTask(id: number) {
    await this.deleteTaskExecutions(id)
    await taskRepo.delete(id)
  }

  /** 内部执行任务的方法 */
  async internalExecuteTask(task: Task, taskExecution: TaskExecution, signal?: AbortSignal) {
    const id = taskExecution.id
    try {
      // 开始执行
      await taskExecutionRepo.update({ id, status: 'running', runAt: Date.now() })

      mainLogger.info(`[task ${task.pluginId} - ${task.id}] 执行中`)
      const taskResult = await taskPluginRunner.run(task, taskExecution, signal)

      // 执行结束
      await taskExecutionRepo.update({
        id,
        status: taskResult.success ? 'success' : 'error',
        endAt: Date.now(),
        result: taskResult,
      })

      mainLogger.info(`[task ${task.pluginId} - ${task.id}] 执行结束`, taskResult)

      return taskResult
    } catch (e) {
      if (e instanceof AbortError) {
        taskExecution.status = 'aborted'
      } else {
        taskExecution.status = 'error'
        taskExecution.result = {
          success: false,
          message: getErrorMessage(e),
        }
      }
      // 执行出错
      await taskExecutionRepo.update({ id, status: taskExecution.status, result: taskExecution.result })
      throw e
    } finally {
      this.abortControllers.delete(taskExecution.id)
    }
  }

  /**
   * 执行任务
   * @param task
   */
  async executeTask(task: Task) {
    if (!task.enabled) throw new Error('任务已被禁用')
    if (await taskExecutionRepo.hasActiveTask(task.id)) throw new Error('当前任务正在运行中...')

    // 新建任务执行记录
    const newTaskExecution: NewTaskExecution = {
      taskId: task.id,
      status: 'pending',
      createdAt: Date.now(),
    }

    const result = await taskExecutionRepo.add(newTaskExecution)
    const taskExecution = await taskExecutionRepo.getById(this.getInsertId(result))
    if (!taskExecution) {
      throw new Error('添加数据失败')
    }

    // 取消信号
    const controller = new AbortController()
    // 先保存到全局状态。用于当前其他地方取消该任务执行
    this.abortControllers.set(taskExecution.id, controller)

    // 异步执行任务
    this.internalExecuteTask(task, taskExecution, controller.signal).then()

    return taskExecution
  }

  /**
   * 取消任务执行
   * @param taskExecutionId   执行id或者执行记录
   * @param reason            取消原因
   */
  async abortTaskExecution(taskExecutionId: number | TaskExecution, reason: string = '取消执行') {
    let id
    if (typeof taskExecutionId === 'number') {
      id = taskExecutionId
    } else if (taskExecutionId) {
      id = taskExecutionId.id
    } else {
      return
      //      throw new Error('取消任务执行失败：taskExecutionId 为空')
    }
    if (this.abortControllers.has(id)) {
      this.abortControllers.get(id)?.abort(reason)
      this.abortControllers.delete(id)
    }
    await taskExecutionRepo.update({ id, status: 'aborted' })
  }

  /**
   * 批量取消执行任务
   */
  async abortTaskExecutions(list: number[] | TaskExecution[], reason: string = '取消执行') {
    if (!list || list.length === 0) return

    const ids = typeof list[0] === 'number' ? (list as number[]) : (list as TaskExecution[]).map((item) => item.id)
    await Promise.all(ids.map((id) => this.abortTaskExecution(id, reason)))
  }

  /**
   * 取消正在执行的任务
   * @param taskId  任务 id
   * @param reason  取消原因
   */
  async abortTaskExecutionByTaskId(taskId: number, reason: string = '取消执行'): Promise<void> {
    return this.abortTaskExecutions(await taskExecutionRepo.getActiveTasks(taskId), reason)
  }

  /**
   * 取消所有任务
   */
  async abortAllTaskExecution(reason: string = '取消执行') {
    await this.abortTaskExecutions(await taskExecutionRepo.getAllActiveTasks(), reason)
    // 确保取消
    for (const abortController of this.abortControllers.values()) {
      abortController.abort(reason)
    }
  }

  /**
   * 删除所有执行任务（会取消正在执行的任务）
   * @param taskId  任务 id
   */
  async deleteTaskExecutions(taskId: number) {
    // 取消正在执行的任务
    await this.abortTaskExecutionByTaskId(taskId)
    await taskExecutionRepo.deleteByTaskId(taskId)
    await taskExecutionLogRepo.deleteByTaskId(taskId)
  }
}

export const taskService = new TaskService()
