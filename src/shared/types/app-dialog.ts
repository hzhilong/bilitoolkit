export const AppDialogTypeMap = {
  // 切换用户
  switch_user: 'switch_user',
} as const

/**
 * 应用对话框类型
 */
export type AppDialogType = (typeof AppDialogTypeMap)[keyof typeof AppDialogTypeMap]
