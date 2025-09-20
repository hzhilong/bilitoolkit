export const APP_DIALOG_TYPE = {
  ACCOUNT_SELECT: 'account-select',
  REQUEST_COOKIE_AUTHORIZATION: 'request-cookie-authorization',
} as const

export type AppDialogType = (typeof APP_DIALOG_TYPE)[keyof typeof APP_DIALOG_TYPE]
