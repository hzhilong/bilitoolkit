import { CommonError } from '@ybgnb/utils'
import { APP_DB_KEYS } from '@/shared/common/app-db.ts'
import { readHostDBDoc } from '@/main/utils/host-app-utils.ts'
import type { BiliAccount } from 'bilitoolkit-api-types'

// 哔哩账号模块
let accounts = new Map<number, BiliAccount>()

/**
 * 刷新数据
 */
const refreshData = () => {
  const dbData = readHostDBDoc(APP_DB_KEYS.BILI_ACCOUNTS)
  if (dbData) {
    accounts = new Map<number, BiliAccount>((dbData as BiliAccount[]).map((account) => [account.mid, account]))
  } else {
    accounts.clear()
  }
}

/**
 * 获取授权的账号（不要直接返回给插件）
 */
const getBiliAccount = (uid: number): BiliAccount => {
  const account = accounts.get(uid)
  if (!account) {
    throw new CommonError('账号不存在，可能已经登出')
  }
  return account
}

export const accountManage = {
  refreshData,
  getBiliAccount,
}
