/**
 * 加载框
 */
export interface LoadingDialogProps {
  // 允许手动关闭
  canCancel?: boolean
  onCancel?: () => void
  loadingText?: string
}

/**
 * 加载框暴露的方法
 */
export type LoadingDialogExposed = {
  show: (options?: LoadingDialogProps) => void
  hide: () => void
}
/**
 * 全局加载框的参数
 */
export type GlobalLoadingDialogProps = {
  // 自动关闭的延迟时间
  autoCloseDelay?: number
} & LoadingDialogProps
