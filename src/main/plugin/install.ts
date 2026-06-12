import type {
  PluginInstallOptions,
  PluginDownloadOptions,
  InstalledToolkitPlugin,
} from '@/shared/types/toolkit-plugin.js'
import NpmUtils from '@/main/utils/npm.js'
import path from 'path'
import { appPath } from '@/main/common/app-path.js'
import { rmdirSync } from 'node:fs'
import { getSessionPartition } from '@/main/utils/session.js'
import { taskService } from '@/main/service/task.service.js'
import { taskRuntime } from '@/main/plugin/task/runtime.js'
import { mainLogger } from '@/main/common/main-logger.js'
import { appEnv } from '@ybgnb/vite-env/common'

/**
 * 下载插件
 * @param options 插件安装选项
 */
export async function downloadPlugin(options: PluginInstallOptions) {
  const dirName = NpmUtils.pkgNameToDirName(options.id)
  const downloadOptions: PluginDownloadOptions = {
    ...options,
    rootDirPath: path.join(appPath.pluginsPath, dirName),
    pluginDirName: dirName,
  }
  await NpmUtils.downloadPluginPackage(downloadOptions, options.version)
  return downloadOptions
}

/**
 * 移除插件运行文件
 */
export async function removePluginFile(plugin: InstalledToolkitPlugin) {
  // 只删除插件文件
  if (!plugin.isTest && !appEnv.DEV) {
    rmdirSync(path.resolve(plugin.files.rootPath), { recursive: true })
  }
  // 删除关联任务
  if (plugin.type === 'task') {
    const tasks = await taskService.getTaskList(plugin.id)
    for (const task of tasks) {
      taskRuntime.deleteTask(task.id).catch(mainLogger.error)
    }
  }
  // 清理会话数据
  if (!appEnv.DEV) {
    getSessionPartition('plugin', plugin).clearData()
  }
}
