import { APP_DB_KEYS } from '@/shared/common/app-db.js'
import { readHostDBDoc, writeHostDBDoc } from '@/main/utils/host-app.js'
import { type UserInfoWithCookie, getCookieValue, userCookieBuilders, setCookieValue } from '@ybgnb/bili-api'
import { AppError } from 'bilitoolkit-types'

class UserManager {
  private users = new Map<number, UserInfoWithCookie>()

  async init() {
    const list = readHostDBDoc<UserInfoWithCookie[]>(APP_DB_KEYS.BILI_USERS)
    if (!list) return

    for (const user of list) {
      for (const [key, valueBuilder] of userCookieBuilders) {
        const oldValue = getCookieValue(user.userCookie.cookie, key)
        if (oldValue == null || oldValue == '') {
          const newValue = await valueBuilder(user.mid)
          user.userCookie.cookie = setCookieValue(user.userCookie.cookie, key, newValue)
        }
      }
    }
    writeHostDBDoc(APP_DB_KEYS.BILI_USERS, list)

    for (const item of list) {
      this.users.set(item.mid, item)
    }
  }

  getBiliUser(uid: number): UserInfoWithCookie | undefined {
    return this.users.get(uid)
  }

  // 可选：需要抛异常时提供显式方法
  getBiliUserOrThrow(uid: number): UserInfoWithCookie {
    const user = this.users.get(uid)
    if (!user) throw new AppError('账号不存在，可能已经登出')
    return user
  }
}

export const userManager = new UserManager()
