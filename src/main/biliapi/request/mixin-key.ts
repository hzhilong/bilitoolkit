import { mainLogger } from '@/main/common/main-logger.ts'
import { BaseUtils } from '@ybgnb/utils'
import { BiliApiHttpError } from 'bilitoolkit-api-types'
import { BiliConstants } from '@/main/biliapi/common/bili-constants.ts'
import { biliApi } from '@/main/biliapi/request/bili-api.ts'
import { dialog } from 'electron';

/**
 * wbi签名需要的参数 mixinKey
 */
let mixinKey: string
// 上一次更新 wbiKey 的时间戳（毫秒）
let wbiKeyLastUpdatedAt: number = 0
// mixinKey 更新定时器
let mixinKeyUpdateTimer: NodeJS.Timeout | undefined = undefined
// 一天的毫秒数
const MILLIS_PER_DAY = 24 * 60 * 60 * 1000

// 判断不是同一天
function isNotSameDay(timestamp1: number, timestamp2: number) {
  return Math.floor(timestamp1 / MILLIS_PER_DAY) !== Math.floor(timestamp2 / MILLIS_PER_DAY)
}

/**
 * 重排映射表
 */
const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41,
  13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34,
  44, 52,
]

/**
 * 生成 MixinKey
 * @param imgKey
 * @param subKey
 */
const generateMixinKey = (imgKey: string, subKey: string) => {
  const raw_wbi_key = imgKey + subKey
  return mixinKeyEncTab
    .map((n) => raw_wbi_key[n])
    .join('')
    .slice(0, 32)
}

// 初始化 mixin key
const initMixinKey = async () => {
  await updateMixinKey()
  if (!mixinKeyUpdateTimer) {
    clearInterval(mixinKeyUpdateTimer)
  }
  mixinKeyUpdateTimer = setInterval(() => {
    if (isNotSameDay(wbiKeyLastUpdatedAt, Date.now())) {
      // 不是同一天，需要更新MixinKey
      updateMixinKey()
    }
  }, 300_000) // 5分钟检测一次
}

// 更新 mixin key
const updateMixinKey = async () => {
  try {
    const now = Date.now()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rep = await biliApi<Record<string, any>>(BiliConstants.BASE_URL + '/x/web-interface/nav', {
      parseBizError: false,
    })
    if (rep.wbi_img && rep.wbi_img.img_url && rep.wbi_img.sub_url) {
      const img_key = rep.wbi_img.img_url.slice(
        rep.wbi_img.img_url.lastIndexOf('/') + 1,
        rep.wbi_img.img_url.lastIndexOf('.'),
      )
      const sub_key = rep.wbi_img.sub_url.slice(
        rep.wbi_img.sub_url.lastIndexOf('/') + 1,
        rep.wbi_img.sub_url.lastIndexOf('.'),
      )
      mixinKey = generateMixinKey(img_key, sub_key)
      mainLogger.debug(`初始化 MixinKey：${mixinKey}`)
      wbiKeyLastUpdatedAt = now
    } else {
      throw new BiliApiHttpError('未知错误')
    }
  } catch (e: unknown) {
    if (e instanceof BiliApiHttpError) {
      dialog.showErrorBox('提示', '初始化哔哩API失败：' + BaseUtils.getErrorMessage(e))
    }
  }
}

export { mixinKey, initMixinKey }
