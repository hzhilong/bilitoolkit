// APP 类型

export const APP_TYPE = {
  HOST_APP: 'HOST_APP',
  DIALOG_APP: 'DIALOG_APP',
} as const

export type AppType = (typeof APP_TYPE)[keyof typeof APP_TYPE]

export type WindowApp =
  | {
      type: 'hostApp'
    }
  | {
      type: 'dialogApp'
    }
