import type { TaskContext, TaskPluginToolkitApi } from 'bilitoolkit-types'
import type { Task, TaskExecution } from '@/shared/types/task.js'
import { buildLogger } from '@/main/plugin/task/logger.js'

/**
 * 任务上下文工厂，用于创建任务执行时的上下文对象。
 * 内部持有 `fetch` 实现，以便在上下文中注入网络请求能力。
 */
export class TaskContextFactory {
  constructor(private fetcher: typeof fetch) {}

  create(api: TaskPluginToolkitApi, task: Task, taskExecution: TaskExecution): TaskContext {
    return {
      api: api,
      config: task.config,
      logger: buildLogger(task.pluginId, taskExecution),
    }
  }
}

/**
 * 默认的任务上下文工厂实例，使用全局 `fetch` 函数。
 * 可直接导入使用，无需手动实例化。
 */
export const taskContextFactory = new TaskContextFactory(fetch)
