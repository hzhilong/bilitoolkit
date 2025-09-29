import { appPath } from '@/main/common/app-path.ts'
import { mainEnv } from '@/main/common/main-env.ts'
import log4js from 'log4js'
import path from 'path'

// 日志路径
export const LOG_DIR = appPath.logsPath

// https://log4js-node.github.io/log4js-node/layouts.html
// 开发环境输出格式头
const devPatternStart = '%d{yyyy-MM-dd hh:mm:ss} %p %f{3}:%l%'
// 生产环境输出格式头
const prodPatternStart = '%d{yyyy-MM-dd hh:mm:ss} %p'
// 使用的输出格式头
const patternStart = mainEnv.isProd ? prodPatternStart : devPatternStart

// https://log4js-node.github.io/log4js-node/api.html
log4js.configure({
  appenders: {
    console: {
      type: 'stdout',
      // 根据日志级别输出不同颜色的头部
      layout: { type: 'pattern', pattern: `%[${patternStart}] - %m%` },
    },
    all: {
      type: 'dateFile',
      filename: path.join(LOG_DIR, 'all-logs.log'),
      compress: true,
      layout: { type: 'pattern', pattern: `${patternStart} - %m%` },
    },
    error: {
      type: 'dateFile',
      level: 'ERROR',
      filename: path.join(LOG_DIR, 'error-logs.log'),
      compress: true,
      layout: { type: 'pattern', pattern: `${patternStart} - %m%` },
    },
    errorFilter: {
      type: 'logLevelFilter',
      level: 'ERROR',
      appender: 'error',
    },
  },
  categories: {
    default: {
      appenders: ['all', 'console', 'errorFilter'],
      level: import.meta.env.APP_LOG_LEVEL || 'info',
      // 开发模式启用调用堆栈，打印行号
      enableCallStack: mainEnv.isDev,
    },
  },
})

/**
 * 主进程Logger
 */
export const mainLogger = log4js.getLogger()
