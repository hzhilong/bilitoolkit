/**
 * 宿主环境定义的全局数据名称
 */
export const HOST_GLOBAL_DATA = {
  /**
   * 内容区域 Bounds
   */
  CONTENT_BOUNDS: 'CONTENT_BOUNDS',
  /**
   * 选择账号（不给cookie）
   */
  CHOOSE_ACCOUNT: 'CHOOSE_ACCOUNT',
  /**
   * 弹窗让用户授权账号cookie给插件
   */
  REQUEST_COOKIE_AUTHORIZATION: 'REQUEST_COOKIE_AUTHORIZATION',
} as const
