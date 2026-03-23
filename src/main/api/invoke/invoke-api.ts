import { eventApi } from './invoke-api-event'
import { globalApi } from '@/main/api/invoke/invoke-api-global.ts'
import { biliApi } from '@/main/api/invoke/invoke-api-bili.ts'
import type {
  ToolkitAccountApi,
  ToolkitApi,
  ToolkitBiliApi,
  ToolkitDBApi,
  ToolkitFileApi,
  ToolkitSystemApi,
  ToolkitWindowApi,
} from 'bilitoolkit-api-types'
import type { ToolkitApiWithCore, ToolkitCoreApi } from '@/shared/types/toolkit-core-api.ts'
import { createApiProxy } from '@/main/api/invoke/base-invoke.ts'

/**
 * 通用API
 */
const commonToolkitApi = {
  window: createApiProxy<ToolkitWindowApi>('window'),
  file: createApiProxy<ToolkitFileApi>('file'),
  system: createApiProxy<ToolkitSystemApi>('system'),
  db: createApiProxy<ToolkitDBApi>('db'),
  account: createApiProxy<ToolkitAccountApi>('account'),
  bili: createApiProxy<ToolkitBiliApi>('bili'),
  event: eventApi,
}

/**
 * 暴露给插件环境的API
 */
export const exposeToolkitApi = {
  ...commonToolkitApi,
  global: globalApi('plugin'),
} satisfies ToolkitApi

/**
 * 暴露给宿主环境的API
 */
export const exposeHostToolkitApi = {
  ...commonToolkitApi,
  global: globalApi('host'),
  core: createApiProxy<ToolkitCoreApi>('core'),
} satisfies ToolkitApiWithCore
