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
  GLOBAL: {
  },
} as const;
