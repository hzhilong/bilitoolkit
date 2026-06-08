import { eventApi } from './invoke-api-event.js'
import { globalApi } from '@/main/api/invoke/invoke-api-global.js'
import type { ToolkitApi } from 'bilitoolkit-types'
import type { ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.js'
import { baseInvokeApi } from '@/main/api/invoke/base-invoke.js'
import { timerApi } from '@/main/api/invoke/invoke-api-timer.js'
import { fileApi } from '@/main/api/invoke/invoke-api-file.js'

/**
 * 基础调用方法（不需要单独实现 invoke 方法的）
 */
export const baseToolkitInvoke = baseInvokeApi

/**
 * 通用的API
 */
const commonToolkitApi = {
  event: eventApi,
  timer: timerApi,
  file: fileApi,
}

/**
 * 暴露给插件环境的API
 */
export const exposeToolkitApi = {
  ...commonToolkitApi,
  global: globalApi('plugin'),
} satisfies Partial<ToolkitApi>

/**
 * 暴露给宿主环境的API
 */
export const exposeHostToolkitApi = {
  ...commonToolkitApi,
  global: globalApi('host'),
} satisfies Partial<ToolkitApiWithCore>
