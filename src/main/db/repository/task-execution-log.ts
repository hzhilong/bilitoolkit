import { db } from '../client.ts'
import type { TaskExecutionLog } from '@/shared/types/task.ts'
import { BaseRepository } from '@/main/db/repository/base.ts'
import type { NewTaskExecutionLog } from '@/main/db/schema.ts'

export class TaskExecutionLogRepository extends BaseRepository {
  async getLogsByExecutionId(executionId: number): Promise<TaskExecutionLog[]> {
    const list = await db
      .selectFrom('task_execution_logs')
      .selectAll()
      .where('executionId', '=', executionId)
      .orderBy('createdAt', 'desc')
      .execute()

    return list
  }

  async add(log: NewTaskExecutionLog) {
    return await db
      .insertInto('task_execution_logs')
      .values({
        executionId: log.executionId,
        level: log.level,
        message: log.message || '',
        createdAt: log.createdAt,
      })
      .execute()
  }

  async getById(id: number): Promise<TaskExecutionLog | undefined> {
    return await db.selectFrom('task_execution_logs').selectAll().where('id', '=', id).executeTakeFirst()
  }

  async deleteByExecutionId(executionId: number) {
    return await db.deleteFrom('task_execution_logs').where('executionId', '=', executionId).execute()
  }

  async deleteByTaskId(taskId: number) {
    await db
      .deleteFrom('task_execution_logs')
      .where('executionId', 'in', (qb) => qb.selectFrom('task_executions').select('id').where('taskId', '=', taskId))
      .execute()
  }
}

// 导出单例
export const taskExecutionLogRepo = new TaskExecutionLogRepository()
