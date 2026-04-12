import { eventApi } from './invoke-api-event'
import { globalApi } from '@/main/api/invoke/invoke-api-global.ts'
import type { ToolkitApi } from 'bilitoolkit-api-types'
import type { ToolkitApiWithCore, ToolkitCoreApi } from '@/shared/types/toolkit-core-api.ts'
import { baseInvokeApi, createApiProxy } from '@/main/api/invoke/base-invoke.ts'

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
  core: createApiProxy<ToolkitCoreApi>('core'),
} satisfies Partial<ToolkitApiWithCore>
