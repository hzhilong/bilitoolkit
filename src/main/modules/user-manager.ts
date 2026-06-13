import { APP_DB_KEYS } from '@/shared/common/app-db.js'
import { readHostDBDoc, writeHostDBDoc } from '@/main/utils/host-app.js'
import type { UserInfo } from '@ybgnb/bili-api'
import { AppError } from 'bilitoolkit-types'

class UserManager {
  private users = new Map<number, UserInfo>()

  refreshFromDB(): void {
    const raw = readHostDBDoc(APP_DB_KEYS.BILI_USERS)
    if (!raw) {
      this.users.clear()
      return
    }
    if (!Array.isArray(raw) || !raw.every((item) => typeof item?.mid === 'number')) {
      console.error('user 数据库读取错误，正在重置')
      writeHostDBDoc(APP_DB_KEYS.BILI_USERS, [])
      this.users.clear()
      return
    }
    const newMap = new Map<number, UserInfo>()
    for (const item of raw as UserInfo[]) {
      newMap.set(item.mid, item)
    }
    this.users = newMap
  }

  getBiliUser(uid: number): UserInfo | undefined {
    return this.users.get(uid)
  }

  // 可选：需要抛异常时提供显式方法
  getBiliUserOrThrow(uid: number): UserInfo {
    const user = this.users.get(uid)
    if (!user) throw new AppError('账号不存在，可能已经登出')
    return user
  }
}

// 暂时废弃
export const userManager = new UserManager()
