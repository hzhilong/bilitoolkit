// 自带的事件通道联合类型
export type HostEventChannel = (typeof HOST_EVENT_CHANNELS)[keyof typeof HOST_EVENT_CHANNELS]

// 自带的事件通道
export const HOST_EVENT_CHANNELS = {
  // 更新主题
  UPDATE_APP_THEME: 'UPDATE_APP_THEME',
  // 账号更新（主要用于对话框环境）
  USER_UPDATE: 'USER_UPDATE',
  // 账号退出
  USER_LOGOUT: 'USER_LOGOUT',
  // 窗口显示
  WINDOW_SHOWN: 'WINDOW_SHOWN',
  // 请求显示信息
  REQ_SHOW_MSG: 'REQ_SHOW_MSG',
  // 更新已安装的插件
  UPDATE_APP_INSTALLED_PLUGINS: 'UPDATE_APP_INSTALLED_PLUGINS',
} as const
