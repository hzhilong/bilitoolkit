// 自带的事件通道
export const HostEventChannels = ['UPDATE_APP_THEME', 'ACCOUNT_LOGOUTED', 'WINDOW_SHOWN'] as const
// 自带的事件通道联合类型
export type HostEventChannel = (typeof HostEventChannels)[number]

export const HOST_EVENT_CHANNELS = HostEventChannels.reduce(
  (acc, channel) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(acc as any)[channel] = channel
    return acc
  },
  {} as { [K in HostEventChannel]: K },
)
