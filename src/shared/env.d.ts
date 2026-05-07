/// <reference types="vite/client" />
// 导入语句会破坏类型增强 https://cn.vite.dev/guide/env-and-mode#intellisense
interface ImportMetaEnv {
  readonly APP_NPM_NAME: string
  readonly APP_PRODUCT_NAME: string
  readonly APP_PRODUCT_CN_NAME: string
  readonly APP_PRODUCT_URL: string
  readonly APP_TITLE: string
  readonly APP_DESCRIPTION: string
  readonly APP_VERSION: string
  readonly APP_AUTHOR: string
  readonly APP_REPO_URL: string
  readonly APP_LOG_LEVEL: string
  readonly BASE_URL: string
  readonly MODE: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
