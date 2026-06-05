import { appEnv } from '@ybgnb/vite-env/common'
import { isLogLevel, type LogLevel } from '@ybgnb/utils'

export const getAppLogLevel = (): LogLevel => {
  const level = appEnv.APP_LOG_LEVEL.toLowerCase()
  if (isLogLevel(level)) {
    return level
  }
  return 'info'
}
