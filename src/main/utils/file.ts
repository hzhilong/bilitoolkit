import { shell } from 'electron'
import path from 'path'
import fs from 'node:fs/promises'
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
 * @param pluginId  关联的插件id
 */
export function getFileRootPath(env: 'plugin', pluginId: string): string
/**
 * 获取文件根目录
 * @param env     调用环境
 * @param pluginId  关联的插件 id
 */
export function getFileRootPath(env: ApiCallerEnvType, pluginId?: string): string {
  if (env === 'host') {
    return path.resolve(path.join(appPath.filePath, MainConstants.FILE.CORE_NAME))
  } else {
    return path.resolve(path.join(appPath.filePath, NpmUtils.pkgNameToDirName(pluginId!)))
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

/**
 * 获取唯一文件路径
 * 如果文件已存在，则自动添加序号避免重名
 * 例如：file.mp4 -> file - 1.mp4
 */
export async function getUniqueFilePath(filePath: string): Promise<string> {
  if (!(await exists(filePath))) {
    return filePath
  }

  const dir = path.dirname(filePath)
  const ext = path.extname(filePath)
  const name = path.basename(filePath, ext)

  let index = 1

  while (true) {
    const newName = `${name} (${index})${ext}`
    const newPath = path.join(dir, newName)

    if (!(await exists(newPath))) {
      return newPath
    }

    index++
  }
}

export async function getUniqueFileName(filePath: string): Promise<string> {
  const dir = path.dirname(filePath)
  const ext = path.extname(filePath)
  const name = path.basename(filePath, ext)

  if (!(await exists(filePath))) {
    return name + ext
  }

  let index = 1

  while (true) {
    const newName = `${name} (${index})${ext}`
    const newPath = path.join(dir, newName)

    if (!(await exists(newPath))) {
      return newName
    }

    index++
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
