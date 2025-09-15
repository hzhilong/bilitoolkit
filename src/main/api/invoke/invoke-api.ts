import { window } from './invoke-api-window'
import { db } from '@/main/api/invoke/invoke-api-db.ts'
import { file } from '@/main/api/invoke/invoke-api-file.ts'

/**
 * 暴露给插件环境的通用API
 */
export const exposeToolkitApi = {
  window,
  db,
  file,
}
/**
 * 暴露给宿主环境的API
 */
export const exposeHostToolkitApi = {
  ...exposeToolkitApi,
}
