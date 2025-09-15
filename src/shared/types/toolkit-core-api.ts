import type { ToolkitApi } from 'bilitoolkit-api-types'

/**
 * 哔哩工具姬API（包含核心API）
 */
export interface ToolkitApiWithCore extends ToolkitApi {
  /**
   * 软件核心相关API（插件模块不能调用）
   */
  core: ToolkitCoreApi
}

/**
 * 哔哩工具姬 API的模块分类
 */
export type ToolkitApiModule = keyof ToolkitApiWithCore

/**
 * 软件核心的API
 */
export interface ToolkitCoreApi {
  /**
   * 打开日志文件夹
   */
  openLogsFolder(): Promise<void>
}
