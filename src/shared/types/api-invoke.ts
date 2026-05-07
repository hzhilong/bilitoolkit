import type { ToolkitApiModule } from '@/shared/types/toolkit-core-api.js'

/**
 * API调用选项（渲染进程调用主进程）
 */
export interface PluginApiInvokeOptions {
  /**
   * api模块（插件模块不能调用 core ）
   */
  module: ToolkitApiModule
  /**
   * api名称 嵌套级别的话则使用.分割
   */
  name: string
  /**
   * api参数
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[]
}

/**
 * 所有层级的 value 类型
 */
export type DeepValue<T> = T extends object ? T | { [K in keyof T]: DeepValue<T[K]> }[keyof T] : T
