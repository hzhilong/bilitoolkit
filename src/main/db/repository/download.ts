import { db } from '../client.js'

import { BaseRepository } from '@/main/db/repository/base.js'
import { type Updateable, type Insertable, sql } from 'kysely'
import type { DownloadRecord } from '@/main/types/download.js'
import { mapRowToDownloadRecord } from '@/main/db/utils/db.js'
import type { DownloadRecordTable, DownloadRecordRow } from '@/main/db/schema.js'
import type { PageParams, PageResult } from 'bilitoolkit-ui'
import type { DownloadTaskFilters } from 'bilitoolkit-types'

export class DownloadRecordRepository extends BaseRepository {
  async getNextDownload(): Promise<DownloadRecord | null> {
    return await db.transaction().execute(async (trx) => {
      const row = await trx
        .selectFrom('download_records')
        .selectAll()
        .where('status', '=', 'pending')
        .orderBy('createdAt', 'asc')
        .limit(1)
        .forUpdate()
        .executeTakeFirst()

      if (row) {
        await trx
          .updateTable('download_records')
          .set({ status: 'downloading', updatedAt: Date.now() })
          .where('id', '=', row.id)
          .execute()
        return mapRowToDownloadRecord(row)
      }
      return null
    })
  }

  async getById(id: number): Promise<DownloadRecord | null> {
    const row = await db.selectFrom('download_records').selectAll().where('id', '=', id).executeTakeFirst()
    return row ? mapRowToDownloadRecord(row) : null
  }

  async getDownloadList(pluginId: string): Promise<DownloadRecord[]> {
    const list = await db
      .selectFrom('download_records')
      .selectAll()
      .where('status', '=', 'downloading')
      .where('pluginId', '=', pluginId)
      .orderBy('createdAt', 'desc')
      .execute()
    return list.map(mapRowToDownloadRecord)
  }

  async getPauseList(pluginId: string): Promise<DownloadRecord[]> {
    const list = await db
      .selectFrom('download_records')
      .selectAll()
      .where('status', '=', 'paused')
      .where('pluginId', '=', pluginId)
      .orderBy('createdAt', 'desc')
      .execute()
    return list.map(mapRowToDownloadRecord)
  }

  async add(data: Omit<Insertable<DownloadRecordTable>, 'id'>): Promise<DownloadRecord> {
    const row = await db.insertInto('download_records').values(data).returningAll().executeTakeFirstOrThrow()
    return mapRowToDownloadRecord(row)
  }

  async update(id: number, updateData: Updateable<DownloadRecordTable>) {
    await db.updateTable('download_records').set(updateData).where('id', '=', id).execute()
  }

  async fetchPage(
    pageParams: PageParams,
    filters: DownloadTaskFilters,
    pluginId?: string,
  ): Promise<PageResult<DownloadRecord>> {
    let query = db.selectFrom('download_records').selectAll()

    if (filters.status) {
      query = query.where('status', '=', filters.status)
    }
    if (pluginId) {
      query = query.where('pluginId', '=', pluginId)
    }
    if (filters.title) {
      // 转义用户输入中的通配符 % 和 _
      const escapeLike = (value: string) => value.replace(/[%_]/g, '\\$&')
      query = query.where(sql<boolean>`title LIKE '%' || ${escapeLike} || '%' ESCAPE '\\'`)
    }

    query = query.orderBy('createdAt', 'desc')

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
    const list = (rows as DownloadRecordRow[]).map(mapRowToDownloadRecord)
    return {
      data: list,
      pageNum: pageNum,
      pageSize: pageSize,
      totalPages: Math.ceil(total / pageSize),
      total: total,
    }
  }

  async pauseAllRunning(): Promise<number> {
    const now = Date.now()

    const result = await db
      .updateTable('download_records')
      .set({
        status: 'paused',
        updatedAt: now,
      })
      .where('status', 'in', ['downloading', 'merging'])
      .executeTakeFirst()

    return Number(result.numUpdatedRows ?? 0)
  }
}

export const downloadRecordRepository = new DownloadRecordRepository()
