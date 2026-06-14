import { appEnv } from '@ybgnb/vite-env/common'

/**
 * 主进程常量
 */
export const MainConstants = {
  // 数据库相关
  DB: {
    // 软件核心的数据库文件夹名称
    CORE_NAME: `${import.meta.env.APP_NPM_NAME}-core`,
  },
  // 文件相关
  FILE: {
    // 软件核心的文件名称
    CORE_NAME: `${import.meta.env.APP_NPM_NAME}-core`,
  },
  // 全局数据
  GLOBAL: {},
} as const

/**
 * 宿主环境专用的api模块
 */
export const HOST_API_MODULES = ['core', 'task']

// 忽略打印日志的 API 路径
export const LOG_IGNORED_API_PATHS: (RegExp | string)[] = appEnv.DEV
  ? []
  : [
      'bili.invokeBiliApi',
      'system.saveLog',
      'system.getAppThemeState',
      'system.shouldUseDarkColors',
      'core.getPluginIcon',
      'core.syncUserList',
      'core.getRecommendedPlugins',
      'core.getInstalledPlugins',
      'user.getMyInfoByCookie',
    ]

// 忽略打印日志的 API 路径
export const LOG_IGNORED_API_SET = new Set(LOG_IGNORED_API_PATHS)
export const LOG_IGNORED_API_REGEXP = appEnv.DEV ? [] : [/^task\./, /^file\./, /^db\./]
