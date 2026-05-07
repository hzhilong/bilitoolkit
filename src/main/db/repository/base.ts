import type { InsertResult } from 'kysely'

export class BaseRepository {
  ifDefined<V, R>(value: V, transformer: (val: Exclude<V, undefined>) => R): R | undefined {
    return value === undefined ? undefined : transformer(value as Exclude<V, undefined>)
  }

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
}
