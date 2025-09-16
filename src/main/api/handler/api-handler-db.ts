import { appPath } from '@/main/common/app-path'
import { MainConstants } from '@/main/common/main-constants'
import { mainLogger } from '@/main/common/main-logger'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { FileUtils } from '@/main/utils/file-utils'
import { CommonError } from '@ybgnb/utils'
import fs from 'fs'
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import path from 'path'
import type { ApiCallerContext, ApiCallerEnvType, IpcToolkitDBApi } from '@/main/types/ipc-toolkit-api.ts'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

/**
 * 获取插件的数据库路径
 * @param env     调用环境
 * @param plugin  关联的插件
 */
export const getPluginDBPath = (env: ApiCallerEnvType, plugin?: ToolkitPlugin): string => {
  if (env === 'host') {
    return path.resolve(path.join(appPath.dbPath, MainConstants.DB.CORE_NAME))
  } else {
    return path.resolve(path.join(appPath.dbPath, plugin!.id))
  }
}

/**
 * 数据库API处理器
 */
export class DBApiHandler extends ApiHandleStrategy implements IpcToolkitDBApi {
  constructor() {
    super()
    // 创建初始目录
    FileUtils.ensureDirExists(appPath.dbPath)
  }

  /**
   * 获取文档路径
   * @param context 插件上下文
   * @param id 文档id
   */
  getDocFilePath(context: ApiCallerContext, id: string): string {
    if (path.normalize(id).includes(path.sep)) {
      throw new CommonError('文档id请勿使用/或者\\')
    }
    // 当前当前文档id关联的文件路径
    const filePath = path.resolve(context.dbPath, id.endsWith('.json') ? id : `${id}.json`)
    // 校验安全路径，防止访问非法路径
    if (!filePath.startsWith(context.dbPath)) {
      throw new CommonError(`非法路径，试图访问受限目录：[${id}]`)
    }
    FileUtils.ensureDirExists(context.dbPath)
    return filePath
  }

  /**
   * 获取存在的文档路径
   * @param context 插件上下文
   * @param id  文档id
   */
  getExistsDocFilePath(context: ApiCallerContext, id: string): string {
    const filePath = this.getDocFilePath(context, id)
    if (!fs.existsSync(filePath)) throw new CommonError(`文档[${id}]不存在`)
    return filePath
  }

  /**
   * 根据文档id前缀获取文件路径列表
   * @param context  插件上下文
   * @param idPrefix id前缀
   */
  getDocFilePathsByPrefix(context: ApiCallerContext, idPrefix: string | undefined): string[] {
    const paths = FileUtils.getFilesByPrefixAndSuffix(context.dbPath, idPrefix)
    if (!paths || paths.length === 0) throw new CommonError(`文档[${idPrefix}]不存在`)
    return paths
  }

  /**
   * 删除文档
   * @param context 插件上下文
   * @param paths 文档路径
   */
  deleteDoc(context: ApiCallerContext, paths: string[]) {
    for (const docPath of paths) {
      if (!docPath.startsWith(context.dbPath)) throw new CommonError(`非法路径，试图访问受限目录：[${docPath}]`)
    }
    return FileUtils.deleteFiles(paths)
  }

  /**
   * 读取文档内容对象
   * @param docPath 文档路径
   */
  readDocObject<T extends object>(docPath: string): T {
    const db = new JSONFileSync<object>(docPath)
    if (db === null) throw new CommonError(`文档[${path.basename(docPath)}]为空`)
    return db.read() as T
  }

  /**
   * 写入文档
   * @param context 插件上下文
   * @param id      文档id
   * @param data    文档数据
   */
  writeDoc<T extends object>(context: ApiCallerContext, id: string, data: T) {
    const db = new LowSync(new JSONFileSync<object>(this.getDocFilePath(context, id)), {})
    db.data = data
    db.write()
  }

  async has(context: ApiCallerContext, id: string): Promise<boolean> {
    return fs.existsSync(this.getDocFilePath(context, id))
  }

  async read<T extends object>(context: ApiCallerContext, id: string): Promise<T> {
    return this.readDocObject<T>(this.getExistsDocFilePath(context, id))
  }

  async init<T extends object>(context: ApiCallerContext, id: string, defaultData: T): Promise<object> {
    const filePath = this.getDocFilePath(context, id)
    if (fs.existsSync(filePath)) {
      // 文档存在，直接读取
      return this.readDocObject<T>(filePath)
    } else {
      // 文档不存在，初始化
      fs.writeFileSync(filePath, '')
      const db = new LowSync(new JSONFileSync<object>(filePath), {})
      db.data = defaultData
      db.write()
      return db.data
    }
  }

  async bulkRead<T extends object>(context: ApiCallerContext, idPrefix: string | undefined): Promise<T[]> {
    const paths = FileUtils.getFilesByPrefixAndSuffix(context.dbPath, idPrefix)
    const dataArr = []
    for (const docPath of paths) {
      dataArr.push(this.readDocObject<T>(docPath))
    }
    return dataArr
  }

  async write<T extends object>(context: ApiCallerContext, id: string, data: T): Promise<void> {
    this.writeDoc<T>(context, id, data)
  }

  async bulkWrite<T extends object>(context: ApiCallerContext, docs: { id: string; data: T }[]): Promise<void> {
    const overlayArr: { db: LowSync<object>; oldData: object }[] = []
    try {
      for (const doc of docs) {
        const id = doc.id
        const db = new LowSync(new JSONFileSync<object>(this.getDocFilePath(context, id)), {})
        if (db.data !== null) {
          // 保存更新之前的数据
          db.read()
          overlayArr.push({ db, oldData: db.data })
        }
        db.data = doc.data
        db.write()
      }
    } catch (e) {
      // 遇到错误
      mainLogger.error('写入数据库失败', e)
      // 还原之前的数据
      for (const overlay of overlayArr) {
        overlay.db.data = overlay.oldData
        try {
          overlay.db.write()
        } catch (oe: unknown) {
          mainLogger.error('写入数据库失败后，恢复旧数据也失败了', oe)
        }
      }
    }
  }

  async delete(context: ApiCallerContext, id: string): Promise<void> {
    fs.unlinkSync(this.getExistsDocFilePath(context, id))
  }

  async bulkDelete(context: ApiCallerContext, idPrefix: string | undefined): Promise<string[]> {
    return this.deleteDoc(context, FileUtils.getFilesByPrefixAndSuffix(context.dbPath, idPrefix))
  }
}
