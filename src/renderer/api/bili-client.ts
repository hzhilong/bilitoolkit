import { BiliClient, type LogLevel } from '@ybgnb/bili-api'
import { appEnv } from '@/shared/common/app-env.ts'

const getLogLevel = (): LogLevel => {
  const level = appEnv.env.APP_LOG_LEVEL.toLowerCase()
  if (['error', 'debug', 'info'].includes(level)) {
    return level as LogLevel
  }
  return 'info'
}

export const biliClient = new BiliClient({ logLevel: getLogLevel() })
