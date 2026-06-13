import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import fs from 'fs'
import type { ApiCallerContext, IpcToolkitFileApi } from '@/main/types/ipc-toolkit-api.js'
import { resolveSafeFilePath } from '@/main/utils/file.js'
import { AppError } from 'bilitoolkit-types'

/**
 * 文件 API 处理器
 */
export class FileApiHandler extends ApiHandleStrategy implements IpcToolkitFileApi {
  constructor() {
    super()
  }

  _exists(absolutePath: string): boolean {
    return fs.existsSync(absolutePath)
  }

  async getRootDir(context: ApiCallerContext): Promise<string> {
    return context.filePath
  }

  async exists(context: ApiCallerContext, filePath: string): Promise<boolean> {
    return this._exists(await resolveSafeFilePath(context, filePath))
  }

  async read(context: ApiCallerContext, filePath: string): Promise<Uint8Array> {
    const absolutePath = await resolveSafeFilePath(context, filePath)
    if (!this._exists(absolutePath)) {
      throw new AppError(`文件[${filePath}]不存在`)
    }
    const buffer = fs.readFileSync(absolutePath)
    return new Uint8Array(buffer)
  }

  async write(context: ApiCallerContext, filePath: string, content: Uint8Array): Promise<void> {
    const absolutePath = await resolveSafeFilePath(context, filePath)
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
    const absolutePath = await resolveSafeFilePath(context, filePath)
    const fd = fs.openSync(absolutePath, 'as+')
    fs.writeSync(fd, content, 0, content.length, position || 0)
    fs.closeSync(fd)
  }

  async delete(context: ApiCallerContext, filePath: string): Promise<void> {
    const absolutePath = await resolveSafeFilePath(context, filePath)
    if (!this._exists(absolutePath)) {
      throw new AppError(`文件[${filePath}]不存在`)
    }
    fs.unlinkSync(absolutePath)
  }

  async bulkDelete(context: ApiCallerContext, filePaths: string[]): Promise<void> {
    const absolutePaths = []
    // 验证路径合法性
    for (const filePath of filePaths) {
      absolutePaths.push(await resolveSafeFilePath(context, filePath))
    }
    // 删除文件
    for (const absolutePath of absolutePaths) {
      try {
        fs.unlinkSync(absolutePath)
      } catch {}
    }
  }
}
