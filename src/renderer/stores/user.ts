import { CommonError } from '@ybgnb/utils'
import { cloneDeep } from 'lodash-es'
import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'
import { APP_DB_KEYS } from '@/shared/common/app-db.ts'
import type { UserInfo } from '@ybgnb/bili-api'

/**
 * 哔哩账号状态 Store
 */
export const useUserStore = defineStore(
  'BiliToolkit-BiliUsers',
  () => {
    const users = reactive<UserInfo[]>([])

    const init = async () => {
      // 获取数据库配置
      const dbConfig = (await window.toolkitApi.db.init(APP_DB_KEYS.BILI_USERS, [])) as UserInfo[]
      Object.assign(users, Array.from(dbConfig))
    }

    // 设置变化后更新数据库
    watch(
      () => users,
      async (newVal, _oldVal) => {
        // 写入配置
        await window.toolkitApi.db.write(APP_DB_KEYS.BILI_USERS, cloneDeep(newVal))
        await window.toolkitApi.core.syncBiliUserState()
      },
      { deep: true },
    )

    // 登录新账号
    const loginUser = (newUser: UserInfo) => {
      for (const user of users) {
        if (user.mid === newUser.mid) {
          // 更新账号
          Object.assign(user, newUser)
          return
        }
      }
      // 添加账号
      users.push(newUser)
    }

    // 注销账号
    const logoutUser = (uid: number) => {
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        if (user.mid === uid) {
          users.splice(i, 1)
          return
        }
      }
    }

    const findUser = (uid: number) => {
      for (const user of users) {
        if (user.mid === uid) {
          return user
        }
      }
      throw new CommonError(`找不到uid=${uid}的用户，可能已登出`)
    }

    return { init, users, loginUser, logoutUser, findUser }
  },
  {
    // 自己实现配置的持久化
    persist: false,
  },
)
