import { BiliClient } from '@ybgnb/bili-api'
import { getLogLevel } from '@/shared/common/bili-api-log.js'

export const biliClient = new BiliClient({ logLevel: getLogLevel() })
