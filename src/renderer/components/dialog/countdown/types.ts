/**
 * 倒计时弹窗
 */
export interface CountdownDialogProps {
  content: string
  // 倒计时，单位 秒
  countdown: number
  // 标题，默认'提示'
  title?: string
  // 确认按钮的文本，默认'确定'
  confirmBtnText?: string
  // 取消按钮的文本，默认'取消'
  cancelBtnText?: string
  // 宽度，默认500
  width?: number
}
