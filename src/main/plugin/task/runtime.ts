import type {
  TaskId,
  TaskExecution,
  TaskTrigger,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskOptions,
  CreateTaskOptions,
  TaskDispatchResult,
  TaskExecutionId,
} from '@/shared/types/task.js'
import { taskService } from '@/main/service/task.service.js'
import { TaskPluginRunner, taskPluginRunner } from '@/main/plugin/task/runner.js'
import { TaskScheduler } from '@/main/plugin/task/scheduler.js'
import { getPreviousCronTime } from '@/shared/utils/cron.js'
import { mainLogger } from '@/main/common/main-logger.js'
import { getErrorMessage, isCanceledError } from '@ybgnb/utils'

/**
 * 任务运行时
 *
 * 这是整个任务系统的“控制中心”：
 * - 启动初始化
 * - 创建/更新/删除/执行/取消
 * - 调度触发后的统一入口
 * - 同一任务串行执行
 * - 不同任务允许并行
 *
 * @author chatgpt...
 */
export class TaskRuntime {
  /**
   * 当前已经处于运行中的任务
   * taskId -> Promise<任务执行记录>
   */
  private readonly runningPromises = new Map<TaskId, Promise<TaskExecution | undefined>>()

  /**
   * 同一个任务在运行中再次触发时，只保留一个 pending 标记。进入排队等待执行
   */
  private readonly pendingTaskIds = new Set<TaskId>()

  private readonly scheduler: TaskScheduler

  constructor(private readonly taskRunner: TaskPluginRunner) {
    this.scheduler = new TaskScheduler(async (taskId: TaskId) => {
      await this.executeTask(taskId, 'schedule')
    })
  }

  /**
   * 应用启动后初始化所有启用任务
   *
   * 行为：
   * 1. 先做补跑判断（如果错过上一次应执行时间，则补跑一次）
   * 2. 再注册调度
   */
  async bootstrap(): Promise<void> {
    // 先将之前正在执行的任务置为失败状态
    await taskService.failAllRunningExecutions()
    mainLogger.info('任务运行时')
    const tasks = await taskService.getEnabledTasks()
    mainLogger.info(`已获取的任务数：${tasks.length}`)

    // 先做补跑，避免调度器刚注册时和补跑撞车
    for (const task of tasks) {
      if (this.shouldRunNow(task, Date.now())) {
        this.executeTask(task.id, 'bootstrap').then().catch(mainLogger.error)
      }
    }

    // 再注册调度
    for (const task of tasks) {
      this.scheduler.register(task)
    }
  }

  /**
   * 创建任务
   *
   * 默认不强制“创建即跑”，避免用户刚建任务就意外执行
   * 如果你确实需要创建后立即执行，把 runImmediately 设为 true
   */
  async createTask(input: CreateTaskInput, options: CreateTaskOptions = {}): Promise<Task> {
    const task = await taskService.createTask(input)

    if (task.enabled) {
      if (options.runImmediately) {
        void this.executeTask(task.id, 'manual')
      }

      this.scheduler.register(task)
    }

    return task
  }

  /**
   * 更新任务
   *
   * 注意：
   * - 如果更新后任务被禁用，会取消当前执行并注销调度
   */
  async updateTask(input: UpdateTaskInput, options: UpdateTaskOptions = {}): Promise<Task> {
    const oldTask = await taskService.getTaskById(input.id)
    if (!oldTask) {
      throw new Error(`任务未找到: ${input.id}`)
    }

    const nextTask = await taskService.updateTask(input)
    if (!nextTask) {
      throw new Error(`任务未找到: ${input.id}`)
    }

    // 先注销旧调度，避免旧配置继续触发
    this.scheduler.unregister(nextTask.id)

    // 任务禁用：取消当前运行并清理 pending
    if (!nextTask.enabled) {
      this.pendingTaskIds.delete(nextTask.id)
      await this.cancelTask(nextTask.id)
      return nextTask
    }

    // 更新后立即补跑一次？
    if (options.runImmediately) {
      void this.executeTask(nextTask.id, 'manual')
    }

    // 注册新调度
    this.scheduler.register(nextTask)

    return nextTask
  }

  /**
   * 删除任务
   *
   * 顺序很重要：
   * 1. 先停止调度
   * 2. 再取消正在执行的任务
   * 3. 再删除任务和关联数据
   */
  async deleteTask(taskId: TaskId): Promise<void> {
    this.scheduler.unregister(taskId)
    this.pendingTaskIds.delete(taskId)

    await this.cancelTask(taskId)
    await taskService.deleteTaskCascade(taskId)
  }

  /**
   * 统一执行入口
   *
   * 规则：
   * - manual：手动执行，允许执行禁用任务
   * - schedule/bootstrap：只对启用任务执行
   * - 同一 task 正在运行时，再次触发不会并发，只会折叠成一个 pending，手动触发会直接拒绝。
   */
  async executeTask(taskId: TaskId, trigger: TaskTrigger = 'manual'): Promise<TaskDispatchResult> {
    const task = await taskService.getTaskById(taskId)
    if (!task) {
      return {
        accepted: false,
        queued: false,
        reason: `任务没有找到: ${taskId}`,
      }
    }

    // 禁用状态不允许自动执行
    if (trigger !== 'manual' && !task.enabled) {
      return {
        accepted: false,
        queued: false,
        reason: `任务已被禁用: ${taskId}`,
      }
    }

    // 同一 task 已在运行：折叠成一个 pending，不并发
    if (this.runningPromises.has(taskId)) {
      if (trigger === 'manual') {
        // 手动执行不允许排队处理
        return {
          accepted: false,
          queued: false,
          reason: `任务正在执行: ${taskId}`,
        }
      } else {
        this.pendingTaskIds.add(taskId)
        return {
          accepted: true,
          queued: true,
          reason: `任务正在执行，已排队待处理: ${taskId}`,
        }
      }
    }

    const promise = this.runOnce(task, trigger)
    this.runningPromises.set(taskId, promise)

    try {
      const execution = await promise
      return {
        accepted: true,
        queued: false,
        execution: execution,
      }
    } finally {
      this.runningPromises.delete(taskId)

      // 当前任务结束后，如果期间又触发过一次，只补跑一次
      // 这里用 fire-and-forget，避免阻塞当前调用方
      void this.flushPending(taskId)
    }
  }

  /**
   * 取消某个任务当前正在运行的执行
   */
  async cancelTask(taskId: TaskId): Promise<boolean> {
    const executionId = taskService.getRunningExecutionId(taskId)
    if (!executionId) {
      this.pendingTaskIds.delete(taskId)
      return false
    }

    // 发出取消信号
    taskService.abortTask(taskId)

    // 等待当前执行真正收口，避免删除/修改时和 finally 打架
    const running = this.runningPromises.get(taskId)
    if (running) {
      await running
    }
    this.pendingTaskIds.delete(taskId)
    return true
  }

  /**
   * 取消任务执行
   */
  async cancelTaskExecution(id: TaskExecutionId): Promise<boolean> {
    const execution = await taskService.getExecutionById(id)
    if (!execution) {
      return false
    }

    // 发出取消信号
    taskService.abortExecution(id)

    // 等待当前执行真正收口，确保已经停止，避免后续并发问题
    const running = this.runningPromises.get(execution.taskId)
    if (running) {
      await running
    }
    this.pendingTaskIds.delete(execution.taskId)
    return true
  }

  /**
   * 应用启动时、启用任务时
   *
   * 规则：
   * - interval：如果距离上次开始执行已经超过间隔，补跑一次
   * - cron：如果上一次开始执行时间早于“最近一个应执行时间”，补跑一次
   *
   */
  shouldRunNow(task: Task, now: number): boolean {
    if (!task.schedule) {
      return false
    }

    // 没执行过时，是否要补跑：
    // 这里按“任务已经存在且错过了应执行点”处理
    const baseTime = task.lastRunAt ?? task.createdAt

    if (task.schedule.type === 'interval') {
      return now - baseTime >= Number(task.schedule.value)
    }

    if (task.schedule.type === 'cron') {
      // 获取 cron 在当前时间之前最近一次应执行的时间
      const previousScheduledAt = getPreviousCronTime(task.schedule.value, now)
      if (previousScheduledAt === undefined) {
        return false
      }

      return baseTime < previousScheduledAt
    }

    return false
  }

  /**
   * 当前任务结束后，如果有 pending，则补跑一次
   */
  private async flushPending(taskId: TaskId): Promise<void> {
    if (!this.pendingTaskIds.has(taskId)) {
      return
    }

    this.pendingTaskIds.delete(taskId)

    const latestTask = await taskService.getTaskById(taskId)
    if (!latestTask || !latestTask.enabled) {
      return
    }

    // 再次触发一次，但仍然走统一入口
    void this.executeTask(taskId, 'schedule')
  }

  /**
   * 真正执行一次任务
   */
  private async runOnce(task: Task, trigger: TaskTrigger): Promise<TaskExecution> {
    const controller = new AbortController()

    // 开始执行：事务性写入执行记录 + 更新 task.lastRunAt + 绑定 AbortController
    const execution = await taskService.beginExecution({
      task,
      trigger,
      controller,
    })

    mainLogger.info(`[task ${task.pluginId} - ${task.id}] 执行中`)

    this.taskRunner
      .run(task, execution, controller.signal)
      .then(async (result) => {
        mainLogger.info(`[task ${task.pluginId} - ${task.id}] 执行结束`, result)
        await taskService.finishExecutionSuccess(execution.id, result)
      })
      .catch(async (error) => {
        const message = getErrorMessage(error)
        if (controller.signal.aborted || isCanceledError(error)) {
          return await taskService.finishExecutionCanceled(execution.id, message)
        }
        return await taskService.finishExecutionError(execution.id, message)
      })

    return execution
  }

  /**
   * 取消所有正在执行的任务
   *
   * 语义：
   * - 对每个正在运行的 task 发出 abort
   * - 等待所有执行真正结束（保证状态落库、资源释放）
   */
  async cancelAll(): Promise<void> {
    // 清掉所有未来执行意图
    this.pendingTaskIds.clear()

    // 拿一份当前运行中的任务列表
    const entries = Array.from(this.runningPromises.entries()) // [taskId, promise][]

    // 发出取消信号
    for (const [taskId] of entries) {
      taskService.abortTask(taskId)
    }

    // 等待所有任务真正结束（保证 finally 已执行）
    await Promise.allSettled(entries.map(([, p]) => p))
  }
}

export const taskRuntime = new TaskRuntime(taskPluginRunner)
