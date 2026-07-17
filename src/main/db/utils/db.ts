/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TaskRow, TaskExecutionRow, DownloadRecordRow, DownloadRecordTable } from '@/main/db/schema.js'
import type { Task, TaskExecution } from '@/shared/types/task.js'
import type { DownloadRecord } from '@/main/types/download.js'
import type { DownloadTaskStatus, DownloadVideo } from 'bilitoolkit-types'
import type { UserCookie } from '@ybgnb/bili-api'
import type { Updateable, Selectable, Insertable } from 'kysely'

/**
 * 将数据库行映射为业务 Task 对象
 */
export const mapRowToTask = (row: TaskRow): Task => {
  return {
    id: row.id,
    pluginId: row.pluginId,
    config: row.config ? JSON.parse(row.config) : undefined,
    schedule: row.schedule ? JSON.parse(row.schedule) : undefined,
    createdAt: row.createdAt,
    lastRunAt: row.lastRunAt,
    enabled: row.enabled !== 0,
  }
}

/**
 * 将数据库行映射为业务 TaskExecution 对象
 */
export const mapRowToExecution = (row: TaskExecutionRow): TaskExecution => {
  return {
    id: row.id,
    taskId: row.taskId,
    status: row.status,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    trigger: row.trigger,
    result: row.result ? JSON.parse(row.result) : '',
  }
}

export function mapDownloadRecordToRow(record: DownloadRecord): Selectable<DownloadRecordTable>
export function mapDownloadRecordToRow(record: Omit<DownloadRecord, 'id'>): Insertable<DownloadRecordTable>
export function mapDownloadRecordToRow(record: Partial<DownloadRecord>): Updateable<DownloadRecordTable>
export function mapDownloadRecordToRow(
  record: DownloadRecord | Omit<DownloadRecord, 'id'> | Partial<DownloadRecord>,
): Selectable<DownloadRecordTable> | Insertable<DownloadRecordTable> | Updateable<DownloadRecordTable> {
  return {
    id: 'id' in record ? record.id : undefined,
    title: record.title,
    pluginId: record.pluginId,
    videos: JSON.stringify(record.videos),
    status: record.status,
    progress: record.progress ? JSON.stringify(record.progress) : undefined,
    result: record.result ? JSON.stringify(record.result) : undefined,
    error: record.error ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    userCookie: JSON.stringify(record.userCookie),
    settings: record.settings ? JSON.stringify(record.settings) : undefined,
  } as Selectable<DownloadRecordTable> | Updateable<DownloadRecordTable>
}

export const mapRowToDownloadRecord = (row: DownloadRecordRow): DownloadRecord => {
  return {
    id: row.id,
    title: row.title,
    pluginId: row.pluginId,
    videos: JSON.parse(row.videos) as DownloadVideo[],
    status: row.status as DownloadTaskStatus,
    progress: row.progress ? JSON.parse(row.progress) : undefined,
    result: row.result ? JSON.parse(row.result) : undefined,
    error: row.error ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userCookie: JSON.parse(row.userCookie) as UserCookie,
    settings: row.settings ? JSON.parse(row.settings) : undefined,
  }
}

export function baseMapDataToRow(data: any): any {
  const row: any = {}
  for (const dataKey in data) {
    const value = data[dataKey]
    if (typeof value === 'object') {
      row[dataKey] = value ? JSON.stringify(value) : undefined
    } else if (typeof value === 'boolean') {
      row[dataKey] = value ? 1 : 0
    } else {
      row[dataKey] = value
    }
  }
  return row
}
