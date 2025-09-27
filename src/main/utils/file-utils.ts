import { mainEnv } from '@/main/common/main-env'
import { mainLogger } from '@/main/common/main-logger.ts'
import { Win32Utils } from '@/main/utils/win32-utils'
import { BaseUtils, CommonError } from '@ybgnb/utils'
import { shell } from 'electron'
import fs from 'fs'
import path from 'path'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import type { ApiCallerEnvType } from '@/main/types/ipc-toolkit-api.ts'
import { appPath } from '@/main/common/app-path.ts'
import { MainConstants } from '@/main/common/main-constants.ts'
import NpmUtils from '@/main/utils/npm-utils.ts'

export class FileUtils {
  /**
   * 获取文件根目录
   * @param env     调用环境
   */
  static getPluginRootPath(env: 'host'): string
  /**
   * 获取文件根目录
   * @param env     调用环境
   * @param plugin  关联的插件
   */
  static getPluginRootPath(env: 'plugin', plugin: ToolkitPlugin): string
  /**
   * 获取文件根目录
   * @param env     调用环境
   * @param plugin  关联的插件
   */
  static getPluginRootPath(env: ApiCallerEnvType, plugin?: ToolkitPlugin): string {
    if (env === 'host') {
      return path.resolve(path.join(appPath.filePath, MainConstants.FILE.CORE_NAME))
    } else {
      return path.resolve(path.join(appPath.filePath, NpmUtils.pkgNameToDirName(plugin!.id)))
    }
  }

  /**
   * 打开资源管理器
   * @param fileOrDir 定位的目录或文件
   */
  static async showItemInFolder(fileOrDir: string): Promise<void> {
    if (mainEnv.isWindows()) {
      await Win32Utils.showItemInFolder(fileOrDir)
    } else {
      shell.showItemInFolder(fileOrDir)
    }
  }

  /**
   * 确保目录存在
   * @param dirPath
   */
  static ensureDirExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  /**
   * 获取目录下符合条件的文件路径（不遍历子目录）
   * @param dir 目标目录路径
   * @param prefix 文件名前缀（需全字匹配）
   * @param suffix 文件名后缀（需全字匹配，如 ".txt"）
   */
  static getFilesByPrefixAndSuffix(dir: string, prefix?: string, suffix?: string): string[] {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter(
        (dirent) =>
          // 仅保留文件（排除子目录）
          dirent.isFile() &&
          // 文件名匹配前缀
          dirent.name.startsWith(prefix || '') &&
          // 文件名匹配后缀
          dirent.name.endsWith(suffix || ''),
      )
      .map((dirent) => path.join(dir, dirent.name))
  }

  /**
   * 删除指定目录下的所有文件和子目录
   * @param directory 目标目录路径
   */
  static deleteFilesInDirectory(directory: string) {
    try {
      // 读取目录中的所有文件和子目录
      const files = fs.readdirSync(directory)
      // 遍历所有文件和子目录
      for (const file of files) {
        const filePath = path.join(directory, file)
        // 获取文件或目录的状态
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          // 如果是目录，递归删除其内容
          FileUtils.deleteFilesInDirectory(filePath)
          // 删除空目录
          fs.rmdirSync(filePath)
        } else {
          // 如果是文件，删除文件
          fs.unlinkSync(filePath)
        }
      }
      mainLogger.info(`已成功删除 ${directory} 下的所有文件和目录`)
    } catch (error) {
      mainLogger.error('删除文件时出错：', error)
      throw BaseUtils.convertToCommonError(error, '删除文件时出错：')
    }
  }

  /**
   * 删除文件
   * @param paths 路径列表
   */
  static deleteFiles(paths: string[]): string[] {
    const deletedPaths: string[] = []
    paths.forEach((path) => {
      if (fs.existsSync(path)) {
        const stat = fs.statSync(path)
        if (stat.isFile()) {
          fs.unlinkSync(path)
          deletedPaths.push(path)
        }
      }
    })
    return deletedPaths
  }

  /**
   * 文件大小格式化成字符串
   * @param kbSize  KB 大小
   * @param invalidStr  无效数字的结果
   */
  static formatKBSize(kbSize: number, invalidStr: string = '') {
    if (!Number.isFinite(kbSize)) {
      return invalidStr
    }
    let size = kbSize * 100
    // 定义文件大小单位
    const units = ['KB', 'MB', 'GB']
    // 计算文件大小的单位和对应的大小
    let unitIndex = 0
    // 根据文件大小单位进行换算
    while (size >= 1024 * 100 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    let newSize = Math.round(size) / 100
    const integerPart = ('' + newSize).split('.')[0]
    if (integerPart.length > 2) {
      newSize = Number(integerPart)
    } else if (integerPart.length > 1) {
      newSize = Math.round(size / 10) / 10
    }
    return `${newSize} ${units[unitIndex]}`
  }

  /**
   * 获取文件/文件夹大小
   * @param filePath 文件/文件夹路径
   */
  static getFileSizeKB(filePath: string) {
    if (!fs.existsSync(filePath)) {
      return 0
    }
    if (FileUtils.isFile(filePath)) {
      return fs.statSync(filePath).size / 1024
    } else {
      return FileUtils.getFolderSizeSync(filePath) / 1024
    }
  }

  /**
   * 同步获取文件夹大小
   * @param dirPath 文件夹路径
   */
  static getFolderSizeSync(dirPath: string): number {
    let totalSize = 0
    const stack: string[] = [dirPath]

    while (stack.length > 0) {
      const currentPath = stack.pop()!
      const entries = fs.readdirSync(currentPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name)

        if (entry.isDirectory()) {
          stack.push(fullPath) // 将子目录加入栈
        } else if (entry.isFile()) {
          const stats = fs.statSync(fullPath)
          totalSize += stats.size
        }
      }
    }

    return totalSize
  }

  /**
   * 判断路径是否是文件
   */
  static isFile(filePath: string): boolean {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
  }

  static readJsonFile<T>(filePath: string): T {
    if (!this.isFile(filePath)) {
      throw new CommonError('文件不存在')
    }
    const jsonRaw = fs.readFileSync(path.resolve(filePath), 'utf-8')
    return JSON.parse(jsonRaw) as T
  }
}
