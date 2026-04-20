import { eventApi } from './invoke-api-event'
import { globalApi } from '@/main/api/invoke/invoke-api-global.ts'
import type { ToolkitApi } from 'bilitoolkit-types'
import type { ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.ts'
import { baseInvokeApi } from '@/main/api/invoke/base-invoke.ts'

export const baseToolkitInvoke = baseInvokeApi

/**
 * 通用API
 */
const commonToolkitApi = {
  event: eventApi,
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
