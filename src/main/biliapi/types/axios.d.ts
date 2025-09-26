import 'axios'
import { AccountCookie } from '@/shared/biliapi/types/BiliAccount'
import type { RequestReturnType } from '@/main/biliapi/types/bili-api-request.ts'

declare module 'axios' {
  interface AxiosRequestConfig {
    // 自动解析业务错误（code不为0直接抛异常） 默认true
    parseBizError?: boolean
    // WBI 签名 默认为true
    wbiSign?: boolean
    // 返回类型 默认apiData
    returnType?: RequestReturnType
    // 账号cookie信息
    accountCookie?: AccountCookie
    // post 请求自动添加csrf参数 默认true
    csrf?: boolean
  }
}
