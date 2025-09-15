// IPC 通道
export const IpcChannels = ['PLUGIN_APIS', 'REQUEST_DATA', 'RESPONSE_DATA'] as const
// IPC 通道联合类型
export type IpcChannel = (typeof IpcChannels)[number]
// IPC 通道对象（方便获取）
export const IPC_CHANNELS = IpcChannels.reduce(
  (acc, channel) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(acc as any)[channel] = channel
    return acc
  },
  {} as { [K in IpcChannel]: K },
)
