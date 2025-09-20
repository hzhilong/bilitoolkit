// APP 类型
import type { AppDialogType } from '@/shared/types/app-dialog.ts'

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
      dialogType: AppDialogType
    }
