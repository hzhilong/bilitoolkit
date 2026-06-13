import type { ApiCallerContext, ApiCallerEnvType } from '@/main/types/ipc-toolkit-api.js'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import path from 'path'
import { appPath } from '@/main/common/app-path.js'
import { MainConstants } from '@/main/common/main-constants.js'
import fs from 'fs'
import { JSONFileSync } from 'lowdb/node'
import { LowSync } from 'lowdb'
import NpmUtils from '@/main/utils/npm.js'
import { ensureDirSync, findFilesByPrefixAndSuffix, deleteFiles } from '@ybgnb/utils/node'
import { AppError } from 'bilitoolkit-types'

export default class DBUtils {
  /**
   * 创建初始目录
   */
  static createDBRootDir() {
    ensureDirSync(appPath.dbPath)
  }

  /**
   * 获取数据库路径
   * @param env     调用环境
   */
  static getDBPath(env: 'host'): string
  /**
   * 获取数据库路径
   * @param env     调用环境
   * @param plugin  关联的插件
   */
  static getDBPath(env: 'plugin', plugin: ToolkitPlugin): string
  /**
   * 获取数据库路径
   * @param env     调用环境
   * @param plugin  关联的插件
   */
  static getDBPath(env: ApiCallerEnvType, plugin?: ToolkitPlugin): string {
    if (env === 'host') {
      return path.resolve(path.join(appPath.dbPath, MainConstants.DB.CORE_NAME))
    } else {
      return path.resolve(path.join(appPath.dbPath, NpmUtils.pkgNameToDirName(plugin!.id)))
    }
  }

  static getPluginDBPath(pluginId: string): string {
    return path.resolve(path.join(appPath.dbPath, NpmUtils.pkgNameToDirName(pluginId)))
  }

  /**
   * 获取文档路径
   * @param dbPath  数据库目录
   * @param id 文档id
   */
  static getDocFilePath(dbPath: string, id: string): string {
    if (path.normalize(id).includes(path.sep)) {
      throw new Error('文档id请勿使用/或者\\')
    }
    // 当前文档id关联的文件路径
    const filePath = path.resolve(dbPath, id.endsWith('.json') ? id : `${id}.json`)
    // 校验安全路径，防止访问非法路径
    if (!filePath.startsWith(dbPath)) {
      throw new Error(`非法路径，试图访问受限目录：[${id}]`)
    }
    // 确保目录存在
    ensureDirSync(dbPath)
    return filePath
  }

  /**
   * 获取存在的文档路径
   * @param dbPath  数据库目录
   * @param id  文档id
   */
  static getExistsDocFilePath(dbPath: string, id: string): string {
    const filePath = this.getDocFilePath(dbPath, id)
    if (!fs.existsSync(filePath)) throw new AppError(`文档[${id}]不存在`)
    return filePath
  }

  /**
   * 根据文档id前缀获取文件路径列表
   * @param context  插件上下文
   * @param idPrefix id前缀
   */
  static async getDocFilePathsByPrefix(context: ApiCallerContext, idPrefix: string | undefined): Promise<string[]> {
    const paths = await findFilesByPrefixAndSuffix(context.dbPath, idPrefix)
    if (!paths || paths.length === 0) throw new Error(`文档[${idPrefix}]不存在`)
    return paths
  }

  /**
   * 删除文档
   * @param context 插件上下文
   * @param paths 文档路径
   */
  static deleteDoc(context: ApiCallerContext, paths: string[]) {
    for (const docPath of paths) {
      if (!docPath.startsWith(context.dbPath)) throw new Error(`非法路径，试图访问受限目录：[${docPath}]`)
    }
    return deleteFiles(paths)
  }

  /**
   * 读取文档内容对象
   * @param docPath 文档路径
   */
  static readDocObject<T extends object>(docPath: string): T | null {
    const db = new JSONFileSync<object>(docPath)
    //    if (db === null) throw new Error(`文档[${path.basename(docPath)}]为空`)
    if (db === null) return null
    return db.read() as T
  }

  /**
   * 写入文档
   * @param dbPath  数据库目录
   * @param id      文档id
   * @param data    文档数据
   */
  static writeDoc<T extends object>(dbPath: string, id: string, data: T) {
    const db = new LowSync(new JSONFileSync<object>(this.getDocFilePath(dbPath, id)), {})
    db.data = data
    db.write()
  }

  /**
   * 初始化文档
   * @param filePath 文档路径
   * @param defaultData 默认数据
   */
  static initDoc<T extends object>(filePath: string, defaultData?: T): T | null {
    if (fs.existsSync(filePath)) {
      // 文档存在，直接读取
      return DBUtils.readDocObject<T>(filePath)
    } else {
      // 文档不存在，初始化
      fs.writeFileSync(filePath, defaultData !== undefined ? '' : 'null')
      const db = new LowSync(new JSONFileSync<object>(filePath), {})
      db.data = defaultData !== undefined ? defaultData : 'null'
      db.write()
      return db.data as T
    }
  }
}
