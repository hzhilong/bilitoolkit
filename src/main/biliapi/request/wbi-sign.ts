import md5 from 'md5'
import type { ApiRequestParams } from '@/main/biliapi/types/bili-api-request.ts'
import { mixinKey } from '@/main/biliapi/request/mixin-key.ts'


// 无效字符的正则
const invalidCharRegex = /[!'()*]/g

/**
 * WBI 签名
 * @param params
 * @param mixinKey
 */
export const wbiSign = (params: ApiRequestParams) => {
  const currTime = Math.round(Date.now() / 1000)

  const newParams = { wts: currTime }
  Object.assign(newParams, params)
  // 按键名升序排序
  const query = Object.keys(newParams)
    .sort()
    .map((key) => {
      // 过滤 value 中的 "!'()*" 字符
      const value = params[key].toString().replace(invalidCharRegex, '')
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('&')

  const wbi_sign = md5(query + mixinKey) // 计算 w_rid

  return query + '&w_rid=' + wbi_sign
}
