import type { BiliAccount } from 'bilitoolkit-api-types'

/**
 * 账号选择弹窗
 */
export interface AccountSelectDialogProps {
  title: string
  onCancel?: () => void
  onSelected: (account: BiliAccount) => void
}

export type AccountSelectDialogExposed = {
  show: (options?: AccountSelectDialogProps) => void
  hide: () => void
}
