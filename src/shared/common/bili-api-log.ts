import { type LogLevel } from '@ybgnb/bili-api'
import { appEnv } from '@/shared/common/app-env.ts'

/**
 * 获取 bili-api 的日志级别
 */
export const getLogLevel = (): LogLevel => {
  const level = appEnv.env.APP_LOG_LEVEL.toLowerCase()
  if (['error', 'debug', 'info'].includes(level)) {
    return level as LogLevel
  }
  return 'info'
}
