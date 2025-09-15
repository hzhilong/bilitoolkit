// 自带的事件通道
export const EventChannels = ['UPDATE_APP_THEME', 'ACCOUNT_LOGOUTED', 'WINDOW_SHOWN'] as const
// 自带的事件通道联合类型
export type EventChannel = (typeof EventChannels)[number]

export const EVENT_CHANNELS = EventChannels.reduce(
  (acc, channel) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(acc as any)[channel] = channel
    return acc
  },
  {} as { [K in EventChannel]: K },
)
