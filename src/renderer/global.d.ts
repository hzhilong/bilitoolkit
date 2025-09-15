
// 对vue进行类型补充说明
import type { ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.ts'

declare module '@vue/runtime-core' {
  // interface ComponentCustomOptions {}

  interface ComponentCustomProperties {
    // 哔哩工具姬 API
    $toolkitApi: ToolkitApiWithCore
  }
}

// 全局类型
declare global {
  export interface Window {
    toolkitApi: ToolkitApiWithCore
  }
}

export {}
