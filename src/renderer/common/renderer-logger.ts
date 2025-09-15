import { consola } from 'consola'

// 配置 consola
// 可选，让 console.xxx 也受控
// consola.wrapAll();

// silent(沉默, 即不打印任何级别的日志): -1
// level 0: fatal、error
// level 1: warn
// level 2: log
// level 3: plugin、success、ready、start
// level 4: debug
// level 5: trace、verbose
// 根据环境控制日志级别
if (import.meta.env.APP_LOG_LEVEL === 'info') {
  consola.level = 3
} else {
  consola.level = 4
}

// 统一封装导出
export const logger = {
  trace: consola.trace as (...args: unknown[]) => void,
  debug: consola.debug as (...args: unknown[]) => void,
  info: consola.info as (...args: unknown[]) => void,
  log: consola.log as (...args: unknown[]) => void,
  warn: consola.warn as (...args: unknown[]) => void,
  error: consola.error as (...args: unknown[]) => void,
  success: consola.success as (...args: unknown[]) => void,
  fatal: consola.fatal as (...args: unknown[]) => void,
}
