import { type BiliClientConfig } from '@ybgnb/bili-api'

export const buildCookieUpdater = (session: Electron.Session): BiliClientConfig['cookieUpdater'] => {
  return async (cookie) => {
    if (cookie.name) {
      await session.cookies.remove(cookie.url, cookie.name)
    }
    await session.cookies.set(cookie)
  }
}
