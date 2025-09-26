import { CommonError } from '@ybgnb/utils'
import { cloneDeep } from 'lodash'
import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'
import type { BiliAccount, BiliAccountInfo } from 'bilitoolkit-api-types'
import { APP_DB_KEYS } from '@/shared/common/app-db.ts'

/**
 * 哔哩账号状态 Store
 */
export const useBiliAccountStore = defineStore(
  'BiliToolkit-BiliAccounts',
  () => {
    const accounts = reactive<BiliAccount[]>([])

    const init = async () => {
      // 获取数据库配置
      const dbConfig = (await window.toolkitApi.db.init(APP_DB_KEYS.BILI_ACCOUNTS, [])) as BiliAccount[]
      Object.assign(accounts, dbConfig)
    }

    // 设置变化后更新数据库
    watch(
      () => accounts,
      async (newVal, _oldVal) => {
        // 写入配置
        await window.toolkitApi.db.write(APP_DB_KEYS.BILI_ACCOUNTS, cloneDeep(newVal))
        await window.toolkitApi.core.updatedLoggedInAccounts()
      },
      { deep: true },
    )

    // 登录新账号
    const loginAccount = (newAccount: BiliAccount) => {
      for (const account of accounts) {
        if (account.mid === newAccount.mid) {
          // 更新账号
          Object.assign(account, newAccount)
          return
        }
      }
      // 添加账号
      accounts.push(newAccount)
    }

    // 注销账号
    const logoutAccount = (oldAccount: BiliAccountInfo) => {
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i]
        if (account.mid === oldAccount.mid) {
          accounts.splice(i, 1)
          return
        }
      }
    }

    const findAccount = (uid: number) => {
      for (const account of accounts) {
        if (account.mid === uid) {
          return account
        }
      }
      throw new CommonError(`找不到uid=${uid}的用户，可能已登出`)
    }

    return { init, accounts, loginAccount, logoutAccount, findAccount }
  },
  {
    // 自己实现配置的持久化
    persist: false,
  },
)
