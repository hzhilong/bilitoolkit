import { db } from './client.js'

export async function initDatabase() {
  // ================= 任务配置 =================
  await db.schema
    .createTable('tasks')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('pluginId', 'varchar', (col) => col.notNull())
    .addColumn('config', 'text')
    .addColumn('schedule', 'text')
    .addColumn('createdAt', 'bigint', (col) => col.notNull())
    .addColumn('lastRunAt', 'bigint')
    .addColumn('enabled', 'integer', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('idx_tasks_pluginId_createdAt')
    .on('tasks')
    .columns(['pluginId', 'createdAt'])
    .ifNotExists()
    .execute()
  // ================= 任务执行记录 =================
  await db.schema
    .createTable('task_executions')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('taskId', 'integer', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) => col.notNull())
    .addColumn('startedAt', 'bigint', (col) => col.notNull())
    .addColumn('endedAt', 'bigint')
    .addColumn('result', 'text')
    .addColumn('trigger', 'varchar(10)', (col) => col.notNull().defaultTo('manual'))
    .addColumn('enabled', 'boolean', (col) => col.notNull().defaultTo(true))
    .execute()
  await db.schema
    .createIndex('idx_task_executions_taskId_startedAt')
    .on('task_executions')
    .columns(['taskId', 'startedAt'])
    .ifNotExists()
    .execute()
  await db.schema
    .createIndex('idx_task_executions_status_startedAt')
    .on('task_executions')
    .columns(['taskId', 'status', 'startedAt'])
    .ifNotExists()
    .execute()
  // ================= 任务执行记录日志 =================
  await db.schema
    .createTable('task_execution_logs')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('executionId', 'integer', (col) => col.notNull())
    .addColumn('level', 'varchar(10)', (col) => col.notNull())
    .addColumn('message', 'text', (col) => col.notNull())
    .addColumn('createdAt', 'bigint', (col) => col.notNull())
    .execute()
  await db.schema
    .createIndex('idx_task_execution_logs_eid_time')
    .on('task_execution_logs')
    .columns(['executionId', 'createdAt'])
    .ifNotExists()
    .execute()

  // ================= 下载记录 =================
  await db.schema
    .createTable('download_records')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('pluginId', 'text', (col) => col.notNull())
    .addColumn('videos', 'text', (col) => col.notNull())
    .addColumn('status', 'text', (col) => col.notNull())
    .addColumn('progress', 'text')
    .addColumn('result', 'text')
    .addColumn('error', 'text')
    .addColumn('createdAt', 'integer', (col) => col.notNull())
    .addColumn('updatedAt', 'integer')
    .addColumn('userCookie', 'text')
    .addColumn('settings', 'text')
    .execute()

  await db.schema
    .createIndex('idx_download_records_status')
    .on('download_records')
    .column('status')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('idx_download_records_createdAt')
    .on('download_records')
    .column('createdAt')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('idx_download_records_title')
    .on('download_records')
    .column('title')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('idx_download_records_status_createdAt')
    .on('download_records')
    .columns(['status', 'createdAt'])
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('idx_download_records_status_pluginId_createdAt')
    .on('download_records')
    .columns(['status', 'pluginId', 'createdAt'])
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('idx_download_records_pluginId_createdAt')
    .on('download_records')
    .columns(['pluginId', 'createdAt'])
    .ifNotExists()
    .execute()
}
