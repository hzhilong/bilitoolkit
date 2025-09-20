// 自带的事件通道联合类型
export type HostEventChannel = (typeof HOST_EVENT_CHANNELS)[keyof typeof HOST_EVENT_CHANNELS]

// 自带的事件通道
export const HOST_EVENT_CHANNELS = {
  // 更新主题
  UPDATE_APP_THEME: 'UPDATE_APP_THEME',
  // 账号退出
  ON_ACCOUNT_LOGOUT: 'ON_ACCOUNT_LOGOUT',
  // 窗口显示
  ON_WINDOW_SHOWN: 'ON_WINDOW_SHOWN',
  // 请求显示信息
  REQ_SHOW_MSG: 'REQ_SHOW_MSG',
} as const
