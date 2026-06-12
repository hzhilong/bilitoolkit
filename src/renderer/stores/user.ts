import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { APP_DB_KEYS } from '@/shared/common/app-db.js'
import type { UserInfoWithCookie } from '@ybgnb/bili-api'
import { HOST_EVENT_CHANNELS } from '@/shared/types/host-event-channel.js'
import { toIPC } from 'bilitoolkit-runtime'
import { toolkitApi } from 'bilitoolkit-ui'

/**
 * 哔哩账号状态 Store
 */
export const useUserStore = defineStore(
  'biliToolkit-users',
  () => {
    const users = reactive<UserInfoWithCookie[]>([])

    const refreshData = async () => {
      // 获取数据库配置
      const list = (await window.toolkitApi.db.init(APP_DB_KEYS.BILI_USERS, [])) as UserInfoWithCookie[]
      users.splice(0, users.length, ...list)
    }

    // 变化后更新数据库和同步主进程
    const updateDBAndSync = async () => {
      // 写入配置
      await window.toolkitApi.db.write(APP_DB_KEYS.BILI_USERS, toIPC(users))
      await window.toolkitApi.event.emit(HOST_EVENT_CHANNELS.USER_UPDATE, window._windowApp)
    }

    const init = async () => {
      await refreshData()
      await window.toolkitApi.event.on(HOST_EVENT_CHANNELS.USER_UPDATE, async (windowApp) => {
        if (windowApp !== window._windowApp) {
          // 非同环境触发
          await refreshData()
        }
      })
    }

    // 登录新账号
    const loginUser = async (newUser: UserInfoWithCookie) => {
      for (const user of users) {
        if (user.mid === newUser.mid) {
          // 更新账号
          Object.assign(user, newUser)
          await updateDBAndSync()
          return
        }
      }
      // 添加账号
      users.push(newUser)
      await updateDBAndSync()
    }

    // 注销账号
    const logoutUser = async (uid: number) => {
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        if (user.mid === uid) {
          users.splice(i, 1)
          await updateDBAndSync()
          await toolkitApi.event.emit(HOST_EVENT_CHANNELS.USER_LOGOUT, toIPC(user))
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
      throw new Error(`找不到uid=${uid}的用户，可能已登出`)
    }

    const setUsers = async (list: UserInfoWithCookie[]) => {
      users.splice(0, users.length, ...list)
      await updateDBAndSync()
    }

    return { init, users, loginUser, logoutUser, findUser, setUsers, refreshData }
  },
  {
    // 自己实现配置的持久化
    persist: false,
  },
)
