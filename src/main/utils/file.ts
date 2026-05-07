import { shell } from 'electron'
import path from 'path'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import type { ApiCallerEnvType } from '@/main/types/ipc-toolkit-api.js'
import { appPath } from '@/main/common/app-path.js'
import { MainConstants } from '@/main/common/main-constants.js'
import NpmUtils from '@/main/utils/npm.js'
import { mainEnv } from '@/main/common/main-env.js'
import { showInExplorer } from '@ybgnb/utils/node'

export class FileUtils {
  /**
   * 获取文件根目录
   * @param env     调用环境
   */
  static getFileRootPath(env: 'host'): string
  /**
   * 获取文件根目录
   * @param env     调用环境
   * @param plugin  关联的插件
   */
  static getFileRootPath(env: 'plugin', plugin: ToolkitPlugin): string

  /**
   * 获取文件根目录
   * @param env     调用环境
   * @param plugin  关联的插件
   */
  static getFileRootPath(env: ApiCallerEnvType, plugin?: ToolkitPlugin): string {
    if (env === 'host') {
      return path.resolve(path.join(appPath.filePath, MainConstants.FILE.CORE_NAME))
    } else {
      return path.resolve(path.join(appPath.filePath, NpmUtils.pkgNameToDirName(plugin!.id)))
    }
  }

  static getPluginFileRootPath(pluginId: string): string {
    return path.resolve(path.join(appPath.filePath, NpmUtils.pkgNameToDirName(pluginId)))
  }

  /**
   * 打开资源管理器
   * @param fileOrDir 定位的目录或文件
   */
  static async showItemInFolder(fileOrDir: string): Promise<void> {
    if (mainEnv.isWindows()) {
      await showInExplorer(fileOrDir)
    } else {
      shell.showItemInFolder(fileOrDir)
    }
  }
}
