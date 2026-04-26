import { db } from '../client.ts'
import type { TaskExecutionRow, TaskExecutionUpdate, NewTaskExecution } from '@/main/db/schema.ts'
import type { TaskExecution, TaskExecutionFilters } from '@/shared/types/task.ts'
import type { PageResult } from '@/shared/types/page.ts'
import { BaseRepository } from '@/main/db/repository/base.ts'

export class TaskExecutionRepository extends BaseRepository {
  private mapRowToData(row: TaskExecutionRow): TaskExecution {
    return {
      id: row.id,
      taskId: row.taskId,
      status: row.status,
      createdAt: row.createdAt,
      runAt: row.runAt,
      endAt: row.endAt,
      result: row.result ? JSON.parse(row.result) : '',
    }
  }

  async getAllActiveTasks(): Promise<TaskExecution[]> {
    const query = db
      .selectFrom('task_executions')
      .selectAll()
      .where('status', 'in', ['pending', 'running'])
      .orderBy('createdAt', 'desc')

    return (await query.execute()).map(this.mapRowToData)
  }

  async getActiveTasks(taskId: number): Promise<TaskExecution[]> {
    const query = db
      .selectFrom('task_executions')
      .selectAll()
      .where('taskId', '=', taskId)
      .where('status', 'in', ['pending', 'running'])
      .orderBy('createdAt', 'desc')

    return (await query.execute()).map(this.mapRowToData)
  }

  async hasActiveTask(taskId: number): Promise<boolean> {
    return (await this.getActiveTasks(taskId)).length > 0
  }

  async getListByPage(filters: TaskExecutionFilters): Promise<PageResult<TaskExecution>> {
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

    if (filters.runAt) {
      query = query.where('runAt', '>=', filters.runAt[0])
      query = query.where('runAt', '<=', filters.runAt[1])
    }

    if (filters.createdAt) {
      query = query.where('createdAt', '>=', filters.createdAt[0])
      query = query.where('createdAt', '<=', filters.createdAt[1])
    }

    if (filters.endAt) {
      query = query.where('endAt', '>=', filters.endAt[0])
      query = query.where('endAt', '<=', filters.endAt[1])
    }

    query = query.orderBy('runAt', 'desc')

    // 先克隆基础查询（包含所有的 where 条件，但不含分页）
    const baseQuery = query

    // 处理分页（仅对获取数据的 query 生效）
    const pageSize = filters.pageSize
    const limit = pageSize
    const pageNum = filters.pageNum
    const offset = (pageNum - 1) * pageSize
    query = query.limit(limit).offset(offset)

    // 并行执行：获取分页数据 和 获取总数
    const [rows, countResult] = await Promise.all([
      query.execute(),
      baseQuery.select((eb) => eb.fn.count('id').as('total')).executeTakeFirstOrThrow(),
    ])

    const total = Number(countResult.total)
    const list = (rows as TaskExecutionRow[]).map(this.mapRowToData)
    return {
      data: list,
      pageNum: pageNum,
      pageSize: pageSize,
      totalPages: Math.ceil(total / pageSize),
      total: total,
    }
  }

  async add(data: NewTaskExecution) {
    return await db
      .insertInto('task_executions')
      .values({
        taskId: data.taskId,
        status: data.status,
        createdAt: data.createdAt,
        runAt: data.runAt,
        endAt: data.endAt ?? undefined,
        result: data.result ? JSON.stringify(data.result) : '',
      })
      .execute()
  }

  async update(data: TaskExecutionUpdate) {
    return await db
      .updateTable('task_executions')
      .set({
        id: data.id,
        status: data.status,
        runAt: data.runAt,
        endAt: data.endAt ?? undefined,
        result: data.result ? JSON.stringify(data.result) : '',
      })
      .where('id', '=', data.id)
      .execute()
  }

  async getById(id: number): Promise<TaskExecution | undefined> {
    const result = await db.selectFrom('task_executions').selectAll().where('id', '=', id).executeTakeFirst()
    return result ? this.mapRowToData(result) : undefined
  }

  async delete(id: number) {
    return await db.deleteFrom('task_executions').where('id', '=', id).execute()
  }

  async deleteByTaskId(taskId: number) {
    return await db.deleteFrom('task_executions').where('taskId', '=', taskId).execute()
  }
}

// 导出单例
export const taskExecutionRepo = new TaskExecutionRepository()
