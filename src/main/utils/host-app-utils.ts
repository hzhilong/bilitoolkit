import { defaultAppSettings, defaultAppThemeState } from '@/shared/common/app-constants'
import { defaultsDeep } from 'lodash'
import { JSONFileSync } from 'lowdb/node'
import path from 'path'
import { getPluginDBPath } from '../api/handler/api-handler-db'
import { FileUtils } from './file-utils'
import type { AppSettings } from '@/shared/types/app-settings.ts'
import { APP_DB_KEYS } from '@/shared/common/app-db-key.ts'
import type { AppThemeState } from 'bilitoolkit-api-types'

const hostDBPath = getPluginDBPath('host')

/**
 * 读取host环境的文档
 * @param docName 文档名称
 */
const readHostDBDoc = <T extends object>(docName: string): T | undefined => {
  FileUtils.ensureDirExists(hostDBPath)
  const filePath = path.resolve(hostDBPath, docName.endsWith('.json') ? docName : `${docName}.json`)
  const db = new JSONFileSync<T>(filePath)
  if (db === null) return undefined
  return db.read() as T
}

export const getAppSettings = (): AppSettings => {
  return defaultsDeep(readHostDBDoc<AppSettings>(APP_DB_KEYS.APP_SETTINGS), defaultAppSettings)
}

export const getAppThemeState = (): AppThemeState => {
  return defaultsDeep(readHostDBDoc<AppThemeState>(APP_DB_KEYS.APP_THEME_STATE), defaultAppThemeState)
}
