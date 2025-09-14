/// <reference types="vite/client" />
// 导入语句会破坏类型增强 https://cn.vite.dev/guide/env-and-mode#intellisense
export interface ImportMetaEnv {
  readonly APP_NPM_NAME: string
  readonly APP_PRODUCT_NAME: string
  readonly APP_PRODUCT_CN_NAME: string
  readonly APP_PRODUCT_URL: string
  readonly APP_TITLE: string
  readonly APP_LOG_LEVEL: string
  readonly APP_VERSION: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  // 和其他环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
