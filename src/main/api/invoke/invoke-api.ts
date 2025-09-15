import { window } from './invoke-api-window'

/**
 * 暴露给插件环境的通用API
 */
export const exposeToolkitApi = {
  window,
}
/**
 * 暴露给宿主环境的API
 */
export const exposeHostToolkitApi = {
  ...exposeToolkitApi,
}
