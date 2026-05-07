import type { UpdateResult, InsertResult, DeleteResult } from 'kysely'

export class BaseService {
  /**
   * 断言插入成功（至少影响一行数据）
   */
  protected getInsertId(result: InsertResult[]) {
    const affected = result[0]?.numInsertedOrUpdatedRows ?? 0n
    if (affected === 0n || result[0].insertId === undefined) {
      throw new Error('添加数据失败')
    }
    return Number(result[0].insertId)
  }

  /**
   * 断言更新成功（至少影响一行数据）
   * @deprecated where不匹配或者数据状态未更新时影响行数可能为0
   */
  protected assertUpdateAffected(result: UpdateResult[]) {
    if (result.length === 0 || result[0].numUpdatedRows === 0n) {
      throw new Error('更新数据失败')
    }
  }

  /**
   * 断言删除成功（至少影响一行数据）
   * @deprecated where不匹配时影响行数可能为0
   */
  protected assertDeleteAffected(result: DeleteResult[]) {
    if (result.length === 0 || result[0].numDeletedRows === 0n) {
      throw new Error('更新数据失败')
    }
  }
}
