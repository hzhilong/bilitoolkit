import { db } from '../client.ts'
import type { TaskRow, TaskUpdate, NewTask } from '@/main/db/schema.ts'
import type { Task } from '@/shared/types/task.ts'
import { BaseRepository } from '@/main/db/repository/base.ts'

export class TaskRepository extends BaseRepository {
  // 将数据库行映射为业务 Task 对象
  private mapRowToData(row: TaskRow): Task {
    return {
      id: row.id,
      pluginId: row.pluginId,
      config: row.config ? JSON.parse(row.config) : undefined,
      schedule: row.schedule ? JSON.parse(row.schedule) : undefined,
      createdAt: row.createdAt,
      enabled: row.enabled !== 0,
    }
  }

  async getList(pluginId?: string): Promise<Task[]> {
    let query = db.selectFrom('tasks').selectAll()
    if (pluginId) {
      query = query.where('pluginId', '=', pluginId).orderBy('createdAt', 'desc')
    } else {
      query = query.orderBy('createdAt', 'desc')
    }

    return (await query.execute()).map(this.mapRowToData)
  }

  async add(task: NewTask) {
    return await db
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

  async update(data: TaskUpdate) {
    return await db
      .updateTable('tasks')
      .set({
        id: data.id,
        config: JSON.stringify(data.config),
        schedule: JSON.stringify(data.schedule),
        enabled: data.enabled ? 1 : 0,
      })
      .where('id', '=', data.id)
      .execute()
  }

  async getById(id: number): Promise<Task | undefined> {
    const result = await db.selectFrom('tasks').selectAll().where('id', '=', id).executeTakeFirst()
    return result ? this.mapRowToData(result) : undefined
  }

  async delete(id: number) {
    return await db.deleteFrom('tasks').where('id', '=', id).execute()
  }
}

// 导出单例
export const taskRepo = new TaskRepository()
