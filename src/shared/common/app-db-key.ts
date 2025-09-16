export const AppDBKeys = ['APP_SETTINGS'] as const
export type AppDBKey = (typeof AppDBKeys)[number]

export const APP_DB_KEYS = AppDBKeys.reduce(
  (acc, channel) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(acc as any)[channel] = channel
    return acc
  },
  {} as { [K in AppDBKey]: K },
)
