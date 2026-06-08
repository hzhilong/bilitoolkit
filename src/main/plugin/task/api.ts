/* eslint-disable @typescript-eslint/no-explicit-any */
import DBUtils from '@/main/utils/db.js'
import type { PluginApiCallerContext } from '@/main/types/ipc-toolkit-api.js'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { windowManager } from '@/main/window/window-manager.js'
import type { ToolkitApi, TaskPluginToolkitApi } from 'bilitoolkit-types'
import { getFileRootPath } from '@/main/utils/file.js'

export function buildTaskPluginApiCallerContext(plugin: InstalledToolkitPlugin) {
  return {
    envType: 'task-plugin',
    plugin: plugin,
    window: windowManager.mainWindow!,
    webContents: windowManager.mainWindow!.webContents,
    dbPath: DBUtils.getDBPath('plugin', plugin),
    filePath: getFileRootPath('plugin', plugin),
  } satisfies PluginApiCallerContext
}

/**
 * 构建给任务插件使用的工具箱 api
 */
export function createTaskPluginApiProxy(plugin: InstalledToolkitPlugin, path: string[] = []): TaskPluginToolkitApi {
  const context = buildTaskPluginApiCallerContext(plugin)
  // 将本来给插件的api封装一下给任务插件
  return new Proxy(() => {}, {
    get(target, key: unknown) {
      if (typeof key !== 'string') return undefined

      if (key === 'then') {
        return (resolve: any, reject: any) => {
          // 这里复用 apply 逻辑
          Promise.resolve(Reflect.apply(target, undefined, [])).then(resolve, reject)
        }
      }

      if (key === '__proto__' || key === 'constructor') {
        return undefined
      }

      return createTaskPluginApiProxy(plugin, [...path, key])
    },

    has(_, key: unknown) {
      // 避免被某些库误判
      if (key === 'then') return true
      return false
    },

    async apply(_, __, args: unknown[]) {
      const [module, ...name] = path
      const moduleName = module as keyof ToolkitApi
      return await windowManager.apiDispatcher.handle(
        null,
        { module: moduleName, name: name.join('.'), args: args },
        context,
      )
    },
  }) as any
}
