import { nanoid } from "nanoid";

// 不要在 electron preload 里使用到该模块
export class IdUtils {
  /**
   * 生产唯一ID
   */
  static generateId(): string {
    return nanoid();
  }
}
