import cron, { type ScheduledTask } from 'node-cron'
import type { TaskId, Task } from '@/shared/types/task.js'

/**
 * 调度触发回调
 */
export type TaskScheduleTrigger = (taskId: TaskId) => void | Promise<void>

/**
 * 任务调度器。只负责时间触发
 * - cron
 * - interval
 */
export class TaskScheduler {
  /**
   * 任务 ID -> cron 定时器
   */
  private readonly cronJobs = new Map<TaskId, ScheduledTask>()

  /**
   * 任务 ID -> interval 定时器
   */
  private readonly intervalTimers = new Map<TaskId, NodeJS.Timeout>()

  constructor(private readonly onTrigger: TaskScheduleTrigger) {}

  /**
   * 注册一个任务的调度
   */
  register(task: Task): void {
    this.unregister(task.id)

    if (!task.enabled || !task.schedule) {
      return
    }

    if (task.schedule.type === 'cron') {
      const job = cron.schedule(task.schedule.value, () => {
        void this.onTrigger(task.id)
      })

      this.cronJobs.set(task.id, job)
      return
    }

    if (task.schedule.type === 'interval') {
      const timer = setInterval(() => {
        void this.onTrigger(task.id)
      }, Number(task.schedule.value))

      this.intervalTimers.set(task.id, timer)
    }
  }

  /**
   * 注销一个任务的调度
   */
  unregister(taskId: TaskId): void {
    const cronJob = this.cronJobs.get(taskId)
    if (cronJob) {
      cronJob.stop()
      this.cronJobs.delete(taskId)
    }

    const timer = this.intervalTimers.get(taskId)
    if (timer) {
      clearInterval(timer)
      this.intervalTimers.delete(taskId)
    }
  }

  /**
   * 刷新任务调度
   */
  refresh(task: Task): void {
    this.unregister(task.id)
    this.register(task)
  }

  /**
   * 停止所有调度
   */
  dispose(): void {
    for (const taskId of this.cronJobs.keys()) {
      this.unregister(taskId)
    }

    for (const taskId of this.intervalTimers.keys()) {
      this.unregister(taskId)
    }
  }
}
