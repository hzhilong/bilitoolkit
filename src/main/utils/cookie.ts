import { type BiliClientConfig } from '@ybgnb/bili-api'

export const buildCookieUpdater = (session: Electron.Session): BiliClientConfig['cookieUpdater'] => {
  return async (cookie) => {
    await session.cookies.set(cookie)
  }
}
