// 自带的事件通道联合类型
export type HostEventChannel = (typeof HOST_EVENT_CHANNELS)[keyof typeof HOST_EVENT_CHANNELS]

// 自带的事件通道
export const HOST_EVENT_CHANNELS = {
  UPDATE_APP_THEME: 'UPDATE_APP_THEME',
  ON_ACCOUNT_LOGOUT: 'ON_ACCOUNT_LOGOUT',
  ON_WINDOW_SHOWN: 'ON_WINDOW_SHOWN',
} as const
