import Database from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import type { DatabaseSchema } from './schema'
import path from 'path'
import { appPath } from '@/main/common/app-path.ts'

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: new Database(path.join(appPath.hostAppDBPath, 'bilitoolkit.db')),
  }),
})
