import { shell } from 'electron'
import path from 'path'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import type { ApiCallerEnvType, ApiCallerContext } from '@/main/types/ipc-toolkit-api.js'
import { appPath } from '@/main/common/app-path.js'
import { MainConstants } from '@/main/common/main-constants.js'
import NpmUtils from '@/main/utils/npm.js'
import { mainEnv } from '@/main/common/main-env.js'
import { showInExplorer, ensureDir } from '@ybgnb/utils/node'
import { AppError } from 'bilitoolkit-types'

/**
 * 获取文件根目录
 * @param env     调用环境
 */
export function getFileRootPath(env: 'host'): string
/**
 * 获取文件根目录
 * @param env     调用环境
 * @param plugin  关联的插件
 */
export function getFileRootPath(env: 'plugin', plugin: ToolkitPlugin): string
/**
 * 获取文件根目录
 * @param env     调用环境
 * @param plugin  关联的插件
 */
export function getFileRootPath(env: ApiCallerEnvType, plugin?: ToolkitPlugin): string {
  if (env === 'host') {
    return path.resolve(path.join(appPath.filePath, MainConstants.FILE.CORE_NAME))
  } else {
    return path.resolve(path.join(appPath.filePath, NpmUtils.pkgNameToDirName(plugin!.id)))
  }
}

export function getPluginFileRootPath(pluginId: string): string {
  return path.resolve(path.join(appPath.filePath, NpmUtils.pkgNameToDirName(pluginId)))
}

/**
 * 打开资源管理器
 * @param fileOrDir 定位的目录或文件
 */
export async function showItemInFolder(fileOrDir: string): Promise<void> {
  if (mainEnv.isWindows()) {
    await showInExplorer(fileOrDir)
  } else {
    shell.showItemInFolder(fileOrDir)
  }
}

/**
 * 解析出安全的绝对路径
 */
export async function resolveSafeFilePath(context: ApiCallerContext, filePath: string) {
  // 当前当前文档id关联的文件路径
  const absolutePath = path.resolve(context.filePath, filePath)
  // 校验安全路径，防止访问非法路径
  if (!absolutePath.startsWith(context.filePath)) {
    throw new AppError(`非法路径，试图访问受限目录：[${filePath}]`)
  }
  await ensureDir(path.dirname(absolutePath))
  return absolutePath
}
