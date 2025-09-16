import { windowApi } from './invoke-api-window'
import { dbApi } from '@/main/api/invoke/invoke-api-db.ts'
import { fileApi } from '@/main/api/invoke/invoke-api-file.ts'
import { systemApi } from '@/main/api/invoke/invoke-api-system.ts'
import { eventApi } from './invoke-api-event'

/**
 * 暴露给插件环境的通用API
 */
export const exposeToolkitApi = {
  windowApi,
  dbApi,
  fileApi,
  systemApi,
  eventApi,
}
/**
 * 暴露给宿主环境的API
 */
export const exposeHostToolkitApi = {
  ...exposeToolkitApi,
}
