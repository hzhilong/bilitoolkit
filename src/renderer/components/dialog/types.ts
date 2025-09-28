import type { BiliAccount, BiliAccountInfo } from 'bilitoolkit-api-types'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

/**
 * 账号选择弹窗
 */
export interface AccountSelectDialogProps {
  title: string
  onCancel?: () => void
  onSelected: (account: BiliAccount) => void
}

export type AccountSelectDialogExposed = {
  show: (options?: Partial<AccountSelectDialogProps>) => void
  hide: () => void
}

export interface AccountAuthDialogProps {
  title: string
  plugin: ToolkitPlugin
  account: BiliAccountInfo
  onCancel?: () => void
  onConfirm: () => void
}

export type AccountAuthDialogExposed = {
  show: (options?: Partial<AccountAuthDialogProps>) => void
  hide: () => void
}
