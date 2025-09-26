import { biliApi } from '@/main/biliapi/request/bili-api'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { BaseUtils } from '@ybgnb/utils'
import {
  BiliApiBusinessError,
  type BiliAccount,
  type LoginQRCode,
  type LoginResultOfQRCode,
  type BiliApiResponse,
  type BiliAccountInfo,
  type BiliAccountCookie,
} from 'bilitoolkit-api-types'
import type { IpcBiliUserApi } from '@/main/biliapi/types/ipc-toolkit-bili-api.ts'
import type { AxiosResponse } from 'axios'
import { BiliCookieUtils } from '@/main/biliapi/utils/bili-cookie-utils.ts'

export class UserApiHandler extends ApiHandleStrategy implements IpcBiliUserApi {
  async getLoginQRCode(): Promise<LoginQRCode> {
    return await biliApi.get<LoginQRCode>(
      'https://passport.bilibili.com/x/passport-login/web/qrcode/generate',
      {},
      { wbiSign: false },
    )
  }

  async loginByQRCode(qrcode_key: string): Promise<LoginResultOfQRCode> {
    const response = await biliApi.get<AxiosResponse<BiliApiResponse<LoginResultOfQRCode>>>(
      'https://passport.bilibili.com/x/passport-login/web/qrcode/poll',
      {
        qrcode_key: qrcode_key,
      },
      { wbiSign: false, returnType: 'httpResponse' },
    )
    const apiResponse = response.data
    const loginResult = apiResponse.data

    // 登录中
    if (loginResult.code !== 0) return loginResult

    // 登录成功
    const setCookie: string[] = response.headers['set-cookie'] as string[]
    const accountCookie = BiliCookieUtils.parseSetCookie(setCookie)
    try {
      // 完善cookie
      const { b_3, b_4 } = await biliApi.get<{ b_3: string; b_4: string }>(
        'https://api.bilibili.com/x/frontend/finger/spi',
        {},
        { wbiSign: false },
      )
      accountCookie.cookies = `${accountCookie.cookies} buvid3=${b_3}; buvid4=${b_4}; `
      loginResult.accountCookie = accountCookie
      return loginResult
    } catch (e) {
      throw new BiliApiBusinessError(`获取buvid3失败：${BaseUtils.getErrorMessage(e)}`)
    }
  }

  async getMyInfo(accountCookie: BiliAccountCookie): Promise<BiliAccount> {
    const info = await biliApi.get<BiliAccountInfo>('https://api.bilibili.com/x/space/myinfo', {}, { accountCookie })
    return {
      ...info,
      ...accountCookie,
    }
  }
}
