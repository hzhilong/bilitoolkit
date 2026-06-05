import { BiliClient } from '@ybgnb/bili-api'
import { getAppLogLevel } from '@/shared/common/app-log'

export const biliClient = new BiliClient({ logLevel: getAppLogLevel() })
