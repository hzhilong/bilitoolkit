import { type LogLevel } from '@ybgnb/bili-api'
import { appEnv } from '@ybgnb/vite-env/common'

/**
 * 获取 bili-api 的日志级别
 */
export const getLogLevel = (): LogLevel => {
  const level = appEnv.APP_LOG_LEVEL.toLowerCase()
  if (['error', 'debug', 'info'].includes(level)) {
    return level as LogLevel
  }
  return 'info'
}
