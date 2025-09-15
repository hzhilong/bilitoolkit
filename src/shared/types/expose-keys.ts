// IPC 通道
export const ExposeKeys = ['toolkitApi', '_windowApp'] as const
// IPC 通道联合类型
export type ExposeKey = (typeof ExposeKeys)[number]
// IPC 通道对象（方便获取）
export const EXPOSE_KEYS = ExposeKeys.reduce(
  (acc, channel) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(acc as any)[channel] = channel
    return acc
  },
  {} as { [K in ExposeKey]: K },
)
