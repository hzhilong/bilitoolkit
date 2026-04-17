import { nanoid } from 'nanoid'

export class IdUtils {
  /**
   * 生产唯一ID
   */
  static generateId(): string {
    return nanoid()
  }
}
