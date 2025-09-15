/**
 * 渲染进程环境变量
 */
export const rendererEnv = {
  env() {
    return {
      APP_NPM_NAME: import.meta.env.APP_NPM_NAME,
      APP_PRODUCT_NAME: import.meta.env.APP_PRODUCT_NAME,
      APP_PRODUCT_CN_NAME: import.meta.env.APP_PRODUCT_CN_NAME,
      APP_PRODUCT_URL: import.meta.env.APP_PRODUCT_URL,
      APP_DESCRIPTION: import.meta.env.APP_DESCRIPTION,
      APP_TITLE: import.meta.env.APP_TITLE,
      APP_LOG_LEVEL: import.meta.env.APP_LOG_LEVEL,
      APP_VERSION: import.meta.env.APP_VERSION,
      APP_AUTHOR: import.meta.env.APP_AUTHOR,
      BASE_URL: import.meta.env.BASE_URL,
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD,
      DEV: import.meta.env.DEV,
    }
  },
  isDev() {
    return import.meta.env.DEV
  },
  isProd() {
    return import.meta.env.PROD
  },
}
