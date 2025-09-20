// 预加载脚本暴露的对象KEY类型
export type ExposeKey = (typeof EXPOSE_KEYS)[keyof typeof EXPOSE_KEYS]

// 预加载脚本暴露的对象KEY
export const EXPOSE_KEYS = {
  toolkitApi: 'toolkitApi',
  _windowApp: '_windowApp',
} as const
