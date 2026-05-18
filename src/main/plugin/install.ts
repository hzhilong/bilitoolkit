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
export function removePluginFile(plugin: InstalledToolkitPlugin) {
  // 只删除插件文件，不删除数据库和其他文件
  if (!plugin.isTest) {
    rmdirSync(path.resolve(plugin.files.rootPath), { recursive: true })
  }
  // 清理会话数据
  getSessionPartition('plugin', plugin).clearData()
}
