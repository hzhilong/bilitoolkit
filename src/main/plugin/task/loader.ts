import type { TaskPlugin, TaskPluginMeta } from 'bilitoolkit-types'
import NpmUtils from '@/main/utils/npm.js'
import { appPath } from '@/main/common/app-path.js'
import path from 'path'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { readJSONFile } from '@ybgnb/utils/node'

/**
 * 加载任务插件实例
 */
export async function loadTaskPlugin(pluginId: string): Promise<TaskPlugin> {
  const rootPath = path.join(appPath.pluginsPath, NpmUtils.pkgNameToDirName(pluginId))
  const mod = await import(path.join(rootPath, 'dist', 'index.js'))

  const plugin = mod.default
  if (!plugin || typeof plugin.run !== 'function') {
    throw new Error('无效插件')
  }

  return plugin as TaskPlugin
}

/**
 * 加载任务插件元信息
 * @param plugin
 */
export async function loadTaskPluginMeta(plugin: InstalledToolkitPlugin): Promise<TaskPluginMeta> {
  const meta: TaskPluginMeta = {}
  try {
    const metaJson = await readJSONFile<TaskPluginMeta>(path.join(plugin.files.distPath, 'plugin-meta.json'))
    if (metaJson && typeof metaJson === 'object') {
      meta.taskConfigSchema = metaJson.taskConfigSchema
      meta.taskSchedule = metaJson.taskSchedule
    }
  } catch {}
  return meta
}
