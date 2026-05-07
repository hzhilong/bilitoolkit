import Database from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import type { DatabaseSchema } from './schema.js'
import path from 'path'
import { appPath } from '@/main/common/app-path.js'

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: new Database(path.join(appPath.hostAppDBPath, 'bilitoolkit.db')),
  }),
})
