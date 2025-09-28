import type { ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.ts'
import { cloneDeepWith } from 'lodash'
import { toRaw } from 'vue'

export const toolkitApi: ToolkitApiWithCore = window.toolkitApi

/**
 * 把数据处理成可安全传给 IPC 的形式
 * @param obj
 */
export const sanitizeForIPC = (obj: unknown) => {
  return cloneDeepWith(toRaw(obj), (val) => {
    if (typeof val === 'function' || val instanceof Window || val instanceof Element) {
      return undefined
    }
  })
}
