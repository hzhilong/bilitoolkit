import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { session } from 'electron'
import { BILIBILI_COOKIE_DOMAIN, USER_COOKIE_NAMES } from '@ybgnb/bili-api'
import { isEmptyArr } from '@ybgnb/utils'
import { trim } from 'lodash-es'
import { AppError } from 'bilitoolkit-types'

/**
 * 获取会话分区标识
 */
export function getSessionPartition(envType: 'host' | 'host-dialog' | 'plugin', plugin?: ToolkitPlugin) {
  if (envType === 'host') {
    return session.defaultSession
  } else if (envType === 'host-dialog') {
    return session.fromPartition(`persist:dialog-app`)
  } else {
    if (!plugin) {
      throw new Error('内部错误')
    }
    return session.fromPartition('persist:plugin-' + plugin.id)
  }
}

export async function getUserCookies(session: Electron.Session) {
  const cookies = await session.cookies.get({ domain: BILIBILI_COOKIE_DOMAIN })
  console.log(`cookie`, cookies)

  if (isEmptyArr(cookies)) throw new AppError('获取cookie失败，请确保已登录成功')

  const map = Object.fromEntries(cookies.map((c) => [c.name, c.value]))

  if (!map.DedeUserID || !map.bili_jct) throw new AppError('当前cookie不完整，请重新登录')

  const userCookies: string[] = []

  USER_COOKIE_NAMES.forEach((name) => {
    userCookies.push(`${name}=${map[name] ?? ''};`)
  })

  return userCookies
}

export async function setUserCookies(session: Electron.Session, cookie: string) {
  const map = Object.fromEntries(
    cookie
      .split(';')
      .map(trim)
      .filter((item) => item.length > 1)
      .map((str) => [str.slice(0, str.indexOf('=')), str.slice(str.indexOf('=') + 1)]),
  )
  for (const name of USER_COOKIE_NAMES) {
    const v = map[name]
    if (v) {
      await session.cookies.set({
        url: 'https://www.bilibili.com',
        name: name,
        value: v,
        domain: BILIBILI_COOKIE_DOMAIN,
        path: '/',
        secure: true,
        sameSite: 'no_restriction',
        httpOnly: name === 'SESSDATA',
      })
    }
  }
}

export async function delUserCookies(session: Electron.Session) {
  for (const name of USER_COOKIE_NAMES) {
    await session.cookies.remove('https://www.bilibili.com', name)
  }
}
