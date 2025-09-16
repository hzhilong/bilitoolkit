import { appPath } from '@/main/common/app-path'
import { MainConstants } from '@/main/common/main-constants'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { FileUtils } from '@/main/utils/file-utils'
import { CommonError } from '@ybgnb/utils'
import fs from 'fs'
import path from 'path'
import type { ApiCallerContext, ApiCallerEnvType, IpcToolkitFileApi } from '@/main/types/ipc-toolkit-api.ts'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

/**
 * 获取插件基础文件目录
 * @param env
 * @param plugin
 */
export const getPluginBaseFilePath = (env: ApiCallerEnvType, plugin?: ToolkitPlugin): string => {
  if (env === 'host') {
    return path.resolve(path.join(appPath.filePath, MainConstants.FILE.CORE_NAME))
  } else {
    return path.resolve(path.join(appPath.dbPath, plugin!.id))
  }
}

/**
 * 核心API处理器
 */
export class FileApiHandler extends ApiHandleStrategy implements IpcToolkitFileApi {
  constructor() {
    super()
    // 创建初始目录
    FileUtils.ensureDirExists(appPath.filePath)
  }

  _exists(absolutePath: string): boolean {
    return fs.existsSync(absolutePath)
  }

  _getFilePath(context: ApiCallerContext, filePath: string): string {
    // 当前当前文档id关联的文件路径
    const absolutePath = path.resolve(context.filePath, filePath)
    // 校验安全路径，防止访问非法路径
    if (!absolutePath.startsWith(context.filePath)) {
      throw new CommonError(`非法路径，试图访问受限目录：[${filePath}]`)
    }
    FileUtils.ensureDirExists(path.dirname(absolutePath))
    return absolutePath
  }

  async exists(context: ApiCallerContext, filePath: string): Promise<boolean> {
    return this._exists(this._getFilePath(context, filePath))
  }

  async read(context: ApiCallerContext, filePath: string): Promise<Uint8Array> {
    const absolutePath = this._getFilePath(context, filePath)
    if (!this._exists(absolutePath)) {
      throw new CommonError(`文件[${filePath}]不存在`)
    }
    const buffer = fs.readFileSync(absolutePath)
    return new Uint8Array(buffer)
  }

  async write(context: ApiCallerContext, filePath: string, content: Uint8Array): Promise<void> {
    const absolutePath = this._getFilePath(context, filePath)
    const fd = fs.openSync(absolutePath, 'as+')
    fs.writeSync(fd, content)
    fs.closeSync(fd)
  }

  async writeChunk(
    context: ApiCallerContext,
    filePath: string,
    content: Uint8Array,
    position: number | undefined,
  ): Promise<void> {
    const absolutePath = this._getFilePath(context, filePath)
    const fd = fs.openSync(absolutePath, 'as+')
    fs.writeSync(fd, content, 0, content.length, position || 0)
    fs.closeSync(fd)
  }

  async delete(context: ApiCallerContext, filePath: string): Promise<void> {
    const absolutePath = this._getFilePath(context, filePath)
    if (!this._exists(absolutePath)) {
      throw new CommonError(`文件[${filePath}]不存在`)
    }
    fs.unlinkSync(absolutePath)
  }

  async bulkDelete(context: ApiCallerContext, filePaths: string[]): Promise<void> {
    const absolutePaths = []
    // 验证路径合法性
    for (const filePath of filePaths) {
      absolutePaths.push(this._getFilePath(context, filePath))
    }
    // 删除文件
    for (const absolutePath of absolutePaths) {
      try {
        fs.unlinkSync(absolutePath)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (__: unknown) {}
    }
  }
}
