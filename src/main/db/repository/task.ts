import { db } from '../client.js'

import type {
  Task,
  TaskExecution,
  TaskExecutionFilters,
  TaskExecutionLog,
  TaskTrigger,
  TaskExecutionId,
  TaskId,
  NewTask,
  TaskUpdate,
  NewTaskExecution,
  TaskExecutionUpdate,
  NewTaskExecutionLog,
} from '@/shared/types/task.js'
import { BaseRepository } from '@/main/db/repository/base.js'
import { mapRowToTask, mapRowToExecution } from '@/main/db/utils/db.js'
import type { TaskExecutionRow, DatabaseSchema } from '@/main/db/schema.js'
import type { Transaction } from 'kysely'
import type { PageResult, PageParams } from 'bilitoolkit-ui'

export class TaskRepository extends BaseRepository {
  async getTasks(pluginId?: string): Promise<Task[]> {
    let query = db.selectFrom('tasks').selectAll()
    if (pluginId) {
      query = query.where('pluginId', '=', pluginId).orderBy('createdAt', 'desc')
    } else {
      query = query.orderBy('createdAt', 'desc')
    }

    return (await query.execute()).map(mapRowToTask)
  }

  async getEnabledTasks(pluginId?: string): Promise<Task[]> {
    let query = db.selectFrom('tasks').selectAll().where('enabled', '=', 1)
    if (pluginId) {
      query = query.where('pluginId', '=', pluginId).orderBy('createdAt', 'desc')
    } else {
      query = query.orderBy('createdAt', 'desc')
    }

    return (await query.execute()).map(mapRowToTask)
  }

  async addTask(task: NewTask, transaction?: Transaction<DatabaseSchema>) {
    return await (transaction ?? db)
      .insertInto('tasks')
      .values({
        pluginId: task.pluginId,
        config: task.config ? JSON.stringify(task.config) : '',
        schedule: task.schedule ? JSON.stringify(task.schedule) : '',
        createdAt: task.createdAt,
        enabled: task.enabled ? 1 : 0,
      })
      .execute()
  }

  async updateTask(data: TaskUpdate, transaction?: Transaction<DatabaseSchema>) {
    return await (transaction ?? db)
      .updateTable('tasks')
      .set({
        id: data.id,
        config: this.ifDefined(data.config, JSON.stringify),
        schedule: this.ifDefined(data.schedule, JSON.stringify),
        lastRunAt: data.lastRunAt,
        enabled: this.ifDefined(data.enabled, Number),
      })
      .where('id', '=', data.id)
      .execute()
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    const result = await db.selectFrom('tasks').selectAll().where('id', '=', id).executeTakeFirst()
    return result ? mapRowToTask(result) : undefined
  }

  async deleteTask(id: number, transaction?: Transaction<DatabaseSchema>) {
    return await (transaction ?? db).deleteFrom('tasks').where('id', '=', id).execute()
  }

  /**
   * 获取活动的执行记录（等待执行、执行中）
   */
  async getActiveExecutions(taskId?: number): Promise<TaskExecution[]> {
    let query = db.selectFrom('task_executions').selectAll()
    if (taskId !== undefined) {
      query = query.where('taskId', '=', taskId)
    }
    query = query.where('status', '=', 'running').orderBy('startedAt', 'desc')

    return (await query.execute()).map(mapRowToExecution)
  }

  /**
   * 是否有活动的执行记录（等待执行、执行中）
   */
  async hasActiveExecution(taskId: number): Promise<boolean> {
    return (await this.getActiveExecutions(taskId)).length > 0
  }

  /**
   * 获取执行记录的分页数据
   * @param filters 查询条件
   */
  async fetchExecutionsPage(pageParams: PageParams, filters: TaskExecutionFilters): Promise<PageResult<TaskExecution>> {
    let query = db.selectFrom('task_executions').selectAll()

    if (filters.id) {
      query = query.where('id', '=', filters.id)
    }
    if (filters.taskId) {
      query = query.where('taskId', '=', filters.taskId)
    }
    if (filters.status) {
      query = query.where('status', '=', filters.status)
    }
    if (filters.trigger) {
      query = query.where('trigger', '=', filters.trigger)
    }

    if (filters.startedAt) {
      query = query.where('startedAt', '>=', filters.startedAt[0])
      query = query.where('startedAt', '<=', filters.startedAt[1])
    }

    if (filters.endedAt) {
      query = query.where('endedAt', '>=', filters.endedAt[0])
      query = query.where('endedAt', '<=', filters.endedAt[1])
    }

    query = query.orderBy('startedAt', 'desc')

    // 先克隆基础查询（包含所有的 where 条件，但不含分页）
    const baseQuery = query

    // 处理分页（仅对获取数据的 query 生效）
    const pageSize = pageParams.pageSize
    const limit = pageSize
    const pageNum = pageParams.pageNum
    const offset = (pageNum - 1) * pageSize
    query = query.limit(limit).offset(offset)

    // 并行执行：获取分页数据 和 获取总数
    const [rows, countResult] = await Promise.all([
      query.execute(),
      baseQuery.select((eb) => eb.fn.count('id').as('total')).executeTakeFirstOrThrow(),
    ])

    const total = Number(countResult.total)
    const list = (rows as TaskExecutionRow[]).map(mapRowToExecution)
    return {
      data: list,
      pageNum: pageNum,
      pageSize: pageSize,
      totalPages: Math.ceil(total / pageSize),
      total: total,
    }
  }

  async addExecution(data: NewTaskExecution, transaction?: Transaction<DatabaseSchema>) {
    return await (transaction ?? db)
      .insertInto('task_executions')
      .values({
        taskId: data.taskId,
        status: data.status,
        startedAt: data.startedAt,
        trigger: data.trigger,
        endedAt: data.endedAt ?? undefined,
        result: data.result ? JSON.stringify(data.result) : '',
      })
      .execute()
  }

  async updateExecution(data: TaskExecutionUpdate, transaction?: Transaction<DatabaseSchema>) {
    return await (transaction ?? db)
      .updateTable('task_executions')
      .set({
        id: data.id,
        status: data.status,
        startedAt: data.startedAt,
        trigger: data.trigger,
        endedAt: data.endedAt,
        result: this.ifDefined(data.result, JSON.stringify),
      })
      .where('id', '=', data.id)
      .execute()
  }

  async getExecutionById(id: number, transaction?: Transaction<DatabaseSchema>): Promise<TaskExecution | undefined> {
    const result = await (transaction ?? db)
      .selectFrom('task_executions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
    return result ? mapRowToExecution(result) : undefined
  }

  async deleteExecution(id: number, transaction?: Transaction<DatabaseSchema>) {
    return await (transaction ?? db).deleteFrom('task_executions').where('id', '=', id).execute()
  }

  async deleteExecutionByTaskId(taskId: number, transaction?: Transaction<DatabaseSchema>) {
    return await (transaction ?? db).deleteFrom('task_executions').where('taskId', '=', taskId).execute()
  }

  async getLogs(executionId: number): Promise<TaskExecutionLog[]> {
    return await db
      .selectFrom('task_execution_logs')
      .selectAll()
      .where('executionId', '=', executionId)
      .orderBy('createdAt', 'desc')
      .execute()
  }

  async addLog(log: NewTaskExecutionLog, transaction?: Transaction<DatabaseSchema>) {
    return await (transaction ?? db)
      .insertInto('task_execution_logs')
      .values({
        executionId: log.executionId,
        level: log.level,
        message: log.message || '',
        createdAt: log.createdAt,
      })
      .execute()
  }

  async getLogById(id: number): Promise<TaskExecutionLog | undefined> {
    return await db.selectFrom('task_execution_logs').selectAll().where('id', '=', id).executeTakeFirst()
  }

  async deleteLogByExecutionId(executionId: number, transaction?: Transaction<DatabaseSchema>) {
    return await (transaction ?? db).deleteFrom('task_execution_logs').where('executionId', '=', executionId).execute()
  }

  async deleteLogByTaskId(taskId: number, transaction?: Transaction<DatabaseSchema>) {
    await (transaction ?? db)
      .deleteFrom('task_execution_logs')
      .where('executionId', 'in', (qb) => qb.selectFrom('task_executions').select('id').where('taskId', '=', taskId))
      .execute()
  }

  /**
   * 删除任务关联的数据（任务、执行记录、执行日志）
   * @param taskId
   */
  async deleteTaskCascade(taskId: TaskId) {
    await db.transaction().execute(async (transaction) => {
      await this.deleteLogByTaskId(taskId, transaction)
      await this.deleteExecutionByTaskId(taskId, transaction)
      await this.deleteTask(taskId, transaction)
    })
  }

  /**
   * 开始一次执行
   */
  async beginExecution(task: Task, trigger: TaskTrigger, startedAt: number) {
    const newTaskExecution: NewTaskExecution = {
      taskId: task.id,
      trigger: trigger,
      status: 'running',
      startedAt: startedAt,
    }
    return await db.transaction().execute(async (transaction) => {
      const insertResult = await this.addExecution(newTaskExecution, transaction)
      await this.updateTask(
        {
          id: task.id,
          lastRunAt: startedAt,
        },
        transaction,
      )
      const execution = await this.getExecutionById(this.getInsertId(insertResult), transaction)
      if (!execution) {
        throw new Error('数据库添加失败')
      }
      return execution
    })
  }

  /**
   * 结束一次执行
   */
  async finishExecution(executionId: TaskExecutionId, patch: Pick<TaskExecution, 'status' | 'endedAt' | 'result'>) {
    await this.updateExecution({
      id: executionId,
      status: patch.status,
      endedAt: patch.endedAt,
      result: patch.result,
    })
    const execution = await this.getExecutionById(executionId)
    if (!execution) {
      throw new Error('该执行记录的数据不存在，任务可能已被删除')
    }
    return execution
  }

  async failAllRunningExecutions() {
    await db
      .updateTable('task_executions')
      .set({
        status: 'error',
        result: JSON.stringify({
          success: false,
          message: '任务被中断',
        }),
      })
      .where('status', '=', 'running')
      .execute()
  }
}

// 导出单例
export const taskRepo = new TaskRepository()
