import { defaultAppSettings, defaultAppThemeState } from '@/shared/common/app-constants'
import { defaultsDeep } from 'lodash'
import { JSONFileSync } from 'lowdb/node'
import path from 'path'
import { FileUtils } from './file-utils'
import type { AppSettings } from '@/shared/types/app-settings.ts'
import { APP_DB_KEYS } from '@/shared/common/app-db.ts'
import type { AppThemeState } from 'bilitoolkit-api-types'
import DBUtils from '@/main/utils/db-utils.ts'
import type { AppInstalledPlugins } from '@/shared/types/toolkit-plugin.ts'

const hostDBPath = DBUtils.getDBPath('host')

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

export const getAppInstalledPlugins = (): AppInstalledPlugins => {
  return defaultsDeep(readHostDBDoc<AppThemeState>(APP_DB_KEYS.APP_INSTALLED_PLUGINS), {
    appVersion: import.meta.env.APP_VERSION,
    plugins: new Map(),
  } satisfies AppInstalledPlugins)
}
