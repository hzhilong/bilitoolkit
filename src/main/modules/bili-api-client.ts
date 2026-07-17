import { BiliClient, type BiliClientConfig, type UserCookie } from '@ybgnb/bili-api'

export const publicClient = new BiliClient()

const allClient = new Map<number, BiliClient>()

export const biliClients = {
  get: (cookie: UserCookie, config?: BiliClientConfig, reset?: boolean) => {
    const { uid } = cookie ?? {}
    if (uid == null) throw new Error('用户未登录')

    if (allClient.has(uid) && !reset) return allClient.get(uid)!

    const client = new BiliClient({
      context: {
        userCookie: cookie,
      },
      ...config,
    })

    allClient.set(uid, client)
    return client
  },
}
