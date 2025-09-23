import { mainLogger } from '@/main/common/main-logger'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { FileUtils } from '@/main/utils/file-utils'
import fs from 'fs'
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import type { ApiCallerContext, IpcToolkitDBApi } from '@/main/types/ipc-toolkit-api.ts'
import DBUtils from '@/main/utils/db-utils.ts'

/**
 * 数据库API处理器
 */
export class DBApiHandler extends ApiHandleStrategy implements IpcToolkitDBApi {
  constructor() {
    super()
    // 创建初始目录
    DBUtils.createDBRootDir()
  }

  async has(context: ApiCallerContext, id: string): Promise<boolean> {
    return fs.existsSync(DBUtils.getDocFilePath(context, id))
  }

  async read<T extends object>(context: ApiCallerContext, id: string): Promise<T> {
    return DBUtils.readDocObject<T>(DBUtils.getExistsDocFilePath(context, id))
  }

  async init<T extends object>(context: ApiCallerContext, id: string, defaultData: T): Promise<T> {
    return DBUtils.initDoc(DBUtils.getDocFilePath(context, id), defaultData)
  }

  async bulkRead<T extends object>(context: ApiCallerContext, idPrefix: string | undefined): Promise<T[]> {
    const paths = FileUtils.getFilesByPrefixAndSuffix(context.dbPath, idPrefix)
    const dataArr = []
    for (const docPath of paths) {
      dataArr.push(DBUtils.readDocObject<T>(docPath))
    }
    return dataArr
  }

  async write<T extends object>(context: ApiCallerContext, id: string, data: T): Promise<void> {
    DBUtils.writeDoc<T>(context, id, data)
  }

  async bulkWrite<T extends object>(context: ApiCallerContext, docs: { id: string; data: T }[]): Promise<void> {
    const overlayArr: { db: LowSync<object>; oldData: object }[] = []
    try {
      for (const doc of docs) {
        const id = doc.id
        const db = new LowSync(new JSONFileSync<object>(DBUtils.getDocFilePath(context, id)), {})
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
    fs.unlinkSync(DBUtils.getExistsDocFilePath(context, id))
  }

  async bulkDelete(context: ApiCallerContext, idPrefix: string | undefined): Promise<string[]> {
    return DBUtils.deleteDoc(context, FileUtils.getFilesByPrefixAndSuffix(context.dbPath, idPrefix))
  }
}
