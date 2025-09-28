import { toolkitApi, sanitizeForIPC } from '@/renderer/api/toolkit-api.ts'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

const cache = new Map<string, string>()
const loadingCache = new Map<string, Promise<string>>()

export const getPluginIconCache = (plugin: ToolkitPlugin): Promise<string> => {
  const id = plugin.id
  const cached = cache.get(id)

  // 已有缓存
  if (cached) return Promise.resolve(cached)

  // 正在加载，复用同一个 Promise
  if (loadingCache.has(id)) {
    return loadingCache.get(id)!
  }

  const promise = toolkitApi.core
    .getPluginIcon(sanitizeForIPC(plugin))
    .then((base64) => {
      cache.set(id, base64)
      return base64
    })
    .catch((err) => {
      throw err
    })
    .finally(() => {
      loadingCache.delete(id)
    })

  loadingCache.set(id, promise)
  return promise
}

export const updatePluginIconCache = (plugin: ToolkitPlugin) => {
  cache.delete(plugin.id)
  return getPluginIconCache(plugin)
}
