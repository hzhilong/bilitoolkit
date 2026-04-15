import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import type { UserInfo } from '@ybgnb/bili-api'

/**
 * 账号选择弹窗
 */
export interface UserSelectDialogProps {
  title: string
  onCancel?: () => void
  onSelected: (user: UserInfo) => void
}

export type UserSelectDialogExposed = {
  show: (options?: Partial<UserSelectDialogProps>) => void
  hide: () => void
}

export interface UserAuthDialogProps {
  title: string
  plugin: ToolkitPlugin
  user: UserInfo
  onCancel?: () => void
  onConfirm: () => void
}

export type UserAuthDialogExposed = {
  show: (options?: Partial<UserAuthDialogProps>) => void
  hide: () => void
}
