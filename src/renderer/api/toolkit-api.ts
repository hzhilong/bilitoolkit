/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.ts'
import { cloneDeepWith } from 'lodash'
import { toRaw } from 'vue'
import { CommonError } from '@ybgnb/utils'

function createApiProxy(path: string[] = []) {
  return new Proxy(() => {}, {
    get(target, key: unknown) {
      if (typeof key !== 'string') return undefined

      // 实现 then
      if (key === 'then') {
        return (resolve: any, reject: any) => {
          // 这里复用 apply 逻辑
          Promise.resolve(Reflect.apply(target, undefined, [])).then(resolve, reject)
        }
      }

      // 保护关键属性
      if (key === '__proto__' || key === 'constructor') {
        return undefined
      }

      return createApiProxy([...path, key])
    },

    has(_, key: unknown) {
      // 避免被某些库误判
      if (key === 'then') return true
      return false
    },

    async apply(_, __, args: unknown[]) {
      const apiPath = path.join('.')

      console.log(`调用[${apiPath}][${args}]`)

      try {
        let expandedApi: any = undefined

        for (let i = 0; i < path.length; i++) {
          const key = path[i]
          if (i === 0) {
            if (key in window.__toolkitApi) {
              expandedApi = window.__toolkitApi[key as keyof ToolkitApiWithCore]
            } else {
              break
            }
          } else {
            if (expandedApi && typeof expandedApi === 'object' && key in expandedApi) {
              expandedApi = (expandedApi as Record<string, any>)[key]
            } else {
              expandedApi = undefined
              break
            }
          }
        }

        if (typeof expandedApi === 'function') {
          return await expandedApi(...args)
        }

        return await window.__toolkitInvoke(apiPath, ...args)
      } catch (e) {
        throw new CommonError('API调用失败', e)
      }
    },
  }) as any
}

window.toolkitApi = createApiProxy([])

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
