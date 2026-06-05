import { appPath } from '@/main/common/app-path.js'
import { mainEnv } from '@/main/common/main-env.js'
import log4js from 'log4js'
import path from 'path'

// 日志路径
export const LOG_DIR = appPath.logsPath
// 开发环境输出格式头    https://log4js-node.github.io/log4js-node/layouts.html
const devPatternStart = '%d{yyyy-MM-dd hh:mm:ss} %p %f{3}:%l%'
// 生产环境输出格式头
const prodPatternStart = '%d{yyyy-MM-dd hh:mm:ss} %p'
// 使用的输出格式头
const patternStart = mainEnv.PROD ? prodPatternStart : devPatternStart
// 日志级别
const level = import.meta.env.APP_LOG_LEVEL || 'info'

// https://log4js-node.github.io/log4js-node/api.html
log4js.configure({
  appenders: {
    console: {
      type: 'stdout',
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
    // 动态多文件分发器
    pluginMultiAppender: {
      type: 'multiFile',
      base: path.join(LOG_DIR, 'plugins'),
      // 通过 getLogger('xxx') 传入的名字来切分
      property: 'categoryName',
      extension: '.log',
      layout: { type: 'pattern', pattern: `${prodPatternStart} - %m%` },
    },
  },
  categories: {
    default: {
      appenders: ['pluginMultiAppender'],
      level: process.env.APP_LOG_LEVEL || 'info',
    },
    main: {
      appenders: ['all', 'console', 'errorFilter'],
      level: level,
      // 开发模式启用调用堆栈，打印行号
      enableCallStack: mainEnv.DEV,
    },
    onlyConsole: {
      appenders: ['console'],
      level: level,
      // 开发模式启用调用堆栈，打印行号
      enableCallStack: mainEnv.DEV,
    },
    onlyFile: {
      appenders: ['all', 'errorFilter'],
      level: level,
      // 开发模式启用调用堆栈，打印行号
      enableCallStack: mainEnv.DEV,
    },
  },
})

/**
 * 主进程Logger
 */
export const mainLogger = log4js.getLogger('main')
export const mainConsoleLogger = log4js.getLogger('onlyConsole')
export const mainFileLogger = log4js.getLogger('onlyFile')

/**
 * 获取插件 Logger
 */
export function getPluginLogger(pluginName: string) {
  return log4js.getLogger(`${pluginName}`)
}
