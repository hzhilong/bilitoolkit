import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import fs from 'fs'
import path from 'path'
import type { ApiCallerContext, IpcToolkitFileApi } from '@/main/types/ipc-toolkit-api.js'
import { ensureDir } from '@ybgnb/utils/node'

/**
 * 核心API处理器
 */
export class FileApiHandler extends ApiHandleStrategy implements IpcToolkitFileApi {
  constructor() {
    super()
  }

  _exists(absolutePath: string): boolean {
    return fs.existsSync(absolutePath)
  }

  async _getFilePath(context: ApiCallerContext, filePath: string) {
    // 当前当前文档id关联的文件路径
    const absolutePath = path.resolve(context.filePath, filePath)
    // 校验安全路径，防止访问非法路径
    if (!absolutePath.startsWith(context.filePath)) {
      throw new Error(`非法路径，试图访问受限目录：[${filePath}]`)
    }
    await ensureDir(path.dirname(absolutePath))
    return absolutePath
  }

  async exists(context: ApiCallerContext, filePath: string): Promise<boolean> {
    return this._exists(await this._getFilePath(context, filePath))
  }

  async read(context: ApiCallerContext, filePath: string): Promise<Uint8Array> {
    const absolutePath = await this._getFilePath(context, filePath)
    if (!this._exists(absolutePath)) {
      throw new Error(`文件[${filePath}]不存在`)
    }
    const buffer = fs.readFileSync(absolutePath)
    return new Uint8Array(buffer)
  }

  async write(context: ApiCallerContext, filePath: string, content: Uint8Array): Promise<void> {
    const absolutePath = await this._getFilePath(context, filePath)
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
    const absolutePath = await this._getFilePath(context, filePath)
    const fd = fs.openSync(absolutePath, 'as+')
    fs.writeSync(fd, content, 0, content.length, position || 0)
    fs.closeSync(fd)
  }

  async delete(context: ApiCallerContext, filePath: string): Promise<void> {
    const absolutePath = await this._getFilePath(context, filePath)
    if (!this._exists(absolutePath)) {
      throw new Error(`文件[${filePath}]不存在`)
    }
    fs.unlinkSync(absolutePath)
  }

  async bulkDelete(context: ApiCallerContext, filePaths: string[]): Promise<void> {
    const absolutePaths = []
    // 验证路径合法性
    for (const filePath of filePaths) {
      absolutePaths.push(await this._getFilePath(context, filePath))
    }
    // 删除文件
    for (const absolutePath of absolutePaths) {
      try {
        fs.unlinkSync(absolutePath)
      } catch {}
    }
  }
}
