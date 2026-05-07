import { defaultAppSettings, defaultAppInstalledPlugins } from '@/shared/common/app-constants.js'
import { defaultsDeep } from 'lodash-es'
import path from 'path'
import type { AppSettings } from '@/shared/types/app-settings.js'
import { APP_DB_KEYS } from '@/shared/common/app-db.js'
import type { AppThemeState } from 'bilitoolkit-types'
import DBUtils from '@/main/utils/db.js'
import type { AppInstalledPlugins } from '@/shared/types/toolkit-plugin.js'
import { writeFileSync } from 'node:fs'
import { appPath } from '@/main/common/app-path.js'
import fs from 'fs'
import { defaultAppThemeState } from 'bilitoolkit-ui/common'

/**
 * 读取host环境的文档
 * @param docName 文档名称
 */
export const readHostDBDoc = <T extends object>(docName: string): T | null => {
  const filePath = path.resolve(appPath.hostAppDBPath, docName.endsWith('.json') ? docName : `${docName}.json`)
  try {
    return DBUtils.readDocObject<T>(filePath)
  } catch (_) {
    return null
  }
}

export const writeHostDBDoc = <T extends object>(docName: string, data: T) => {
  DBUtils.writeDoc(appPath.hostAppDBPath, docName, data)
}

export const getAppSettings = (): AppSettings => {
  return defaultsDeep(readHostDBDoc<AppSettings>(APP_DB_KEYS.APP_SETTINGS), defaultAppSettings)
}

export const getAppThemeState = (): AppThemeState => {
  return defaultsDeep(readHostDBDoc<AppThemeState>(APP_DB_KEYS.APP_THEME_STATE), defaultAppThemeState)
}

export const getAppInstalledPlugins = (): AppInstalledPlugins => {
  const data = defaultsDeep(
    readHostDBDoc<AppThemeState>(APP_DB_KEYS.APP_INSTALLED_PLUGINS),
    defaultAppInstalledPlugins,
  ) as AppInstalledPlugins
  data.plugins = Array.from(data.plugins)
  return data
}

export const writeHostTxtFile = (fileName: string, content: string) => {
  const filePath = path.join(appPath.hostAppFilePath, fileName)
  writeFileSync(filePath, content, 'utf8')
}

export const readHostTxtFile = (fileName: string) => {
  const filePath = path.join(appPath.hostAppFilePath, fileName)
  return fs.readFileSync(filePath, 'utf-8') as string
}
