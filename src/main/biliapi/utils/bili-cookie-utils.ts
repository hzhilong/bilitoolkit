import { type BiliAccountCookie, BiliApiBusinessError } from 'bilitoolkit-api-types'

export class BiliCookieUtils {
  /**
   * 解析 cookie
   */
  static parseSetCookie(setCookie: string[]): BiliAccountCookie {
    if (!setCookie) throw new BiliApiBusinessError('登录失败，响应缺少cookie')

    const cookies = []
    let bili_jct
    let uid
    for (const cookie of setCookie) {
      if (cookie) {
        const item = cookie.slice(0, cookie.indexOf(';') + 1)
        cookies.push(item)
        if (item.startsWith('bili_jct=')) {
          bili_jct = item.slice('bili_jct='.length, -1)
        }
        if (item.startsWith('DedeUserID=')) {
          uid = item.slice('DedeUserID='.length, -1)
        }
      }
    }
    if (!bili_jct || !uid) throw new BiliApiBusinessError('登录失败，cookie不完整')

    return {
      cookies: cookies.join(' '),
      bili_jct: bili_jct,
    }
  }
}
