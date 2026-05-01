import type { ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.ts'
import type { WindowApp } from '@/shared/types/app-types.ts'

declare module 'vue' {
  // interface ComponentCustomOptions {}
  // 对vue进行类型补充说明
  interface ComponentCustomProperties {
    // 哔哩工具姬 API
    $toolkitApi: ToolkitApiWithCore
  }
}

// 全局类型
declare global {
  export interface Window {
    _windowApp: WindowApp | undefined
    __toolkitApi: ToolkitApiWithCore
    __toolkitInvoke: (apiPath: string, ...args: unknown[]) => unknown
    toolkitApi: ToolkitApiWithCore
  }
}

export {}
