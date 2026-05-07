import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import type { UserInfoWithCookie } from '@ybgnb/bili-api'

/**
 * 账号选择弹窗
 */
export interface UserSelectDialogProps {
  title: string
  emptyMessage?: string
  onCancel?: () => void
  onSelected: (user: UserInfoWithCookie) => void
  disableUserList?: UserInfoWithCookie[]
}

export type UserSelectDialogExposed = {
  show: (options?: Partial<UserSelectDialogProps>) => void
  hide: () => void
}

export interface UserAuthDialogProps {
  title: string
  plugin: ToolkitPlugin
  user: UserInfoWithCookie
  onCancel?: () => void
  onConfirm: () => void
}

export type UserAuthDialogExposed = {
  show: (options?: Partial<UserAuthDialogProps>) => void
  hide: () => void
}
