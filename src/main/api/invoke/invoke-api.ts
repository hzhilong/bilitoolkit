import { windowApi } from './invoke-api-window'
import { dbApi } from '@/main/api/invoke/invoke-api-db.ts'
import { fileApi } from '@/main/api/invoke/invoke-api-file.ts'
import { systemApi } from '@/main/api/invoke/invoke-api-system.ts'
import { eventApi } from './invoke-api-event'
import { globalApi } from '@/main/api/invoke/invoke-api-global.ts'
import { accountApi } from '@/main/api/invoke/invoke-api-account.ts'
import { coreApi } from '@/main/api/invoke/invoke-api-core.ts'

/**
 * 暴露给插件环境的通用API
 */
export const exposeToolkitApi = {
  window: windowApi,
  db: dbApi,
  file: fileApi,
  system: systemApi,
  event: eventApi,
  global: globalApi,
  account: accountApi,
}
/**
 * 暴露给宿主环境的API
 */
export const exposeHostToolkitApi = {
  ...exposeToolkitApi,
  core: coreApi,
}
