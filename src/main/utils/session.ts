import type { ApiCallerEnvType } from '@/main/types/ipc-toolkit-api.ts'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { session } from 'electron'
import { BILIBILI_COOKIE_DOMAIN, USER_COOKIE_NAMES } from '@ybgnb/bili-api'
import { isEmptyArr, CommonError } from '@ybgnb/utils'

/**
 * 获取会话分区标识
 */
export function getSessionPartition<E extends ApiCallerEnvType>(
  envType: E,
  plugin: E extends 'plugin' ? ToolkitPlugin : never,
) {
  if (envType === 'host') {
    return session.fromPartition(`<dialog-app>`)
  } else {
    return session.fromPartition('<plugin-' + plugin.id + '>')
  }
}

export async function getUserCookies(session: Electron.Session) {
  const cookies = await session.cookies.get({ domain: BILIBILI_COOKIE_DOMAIN })

  if (isEmptyArr(cookies)) throw new CommonError('获取cookie失败，请确保已登录成功')

  const map = Object.fromEntries(cookies.map((c) => [c.name, c.value]))

  if (!map.DedeUserID || !map.bili_jct) throw new CommonError('当前cookie不完整，请重新登录')

  const userCookies: string[] = []

  USER_COOKIE_NAMES.forEach((name) => {
    userCookies.push(`${name}=${map[name] ?? ''};`)
  })

  return userCookies
}
