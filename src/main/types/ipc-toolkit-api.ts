import { BrowserWindow, WebContentsView } from 'electron'
import WebContents = Electron.WebContents
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import type { ToolkitCoreApi } from '@/shared/types/toolkit-core-api.ts'
import type {
  ToolkitAccountApi,
  ToolkitDBApi,
  ToolkitEventApi,
  ToolkitFileApi,
  ToolkitGlobalDataApi,
  ToolkitSystemApi,
  ToolkitWindowApi,
} from 'bilitoolkit-api-types'

/**
 * API调用环境：宿主环境|插件环境
 */
export type ApiCallerEnvType = 'host' | 'plugin'

// 通用的API调用上下文
type CommonApiCallerContext = {
  // 所属窗口
  window: BrowserWindow
  // 所属WebContents
  webContents: WebContents
  // 数据库路径
  dbPath: string
  // 基础文件路径
  filePath: string
}
export type HostApiCallerContext = CommonApiCallerContext & {
  envType: 'host'
}

export type PluginApiCallerContext = CommonApiCallerContext & {
  // 插件环境
  envType: 'plugin'
  // 插件信息
  plugin: ToolkitPlugin
  // 所属的插件WebContentsView
  webContentsView: WebContentsView
  // 所属宿主WebContents
  hostWebContents: WebContents
}

/**
 * API调用的上下文
 */
export type ApiCallerContext = HostApiCallerContext | PluginApiCallerContext

/**
 * 递归添加上下文参数的类型工具（顶层属性）
 */
// export type AddApiCallerContext<T> = {
//   [K in keyof T]: T[K] extends (...args: infer P) => infer R ? (context: ApiCallerContext, ...args: P) => R : never
// }
/**
 * 递归添加上下文参数的类型工具
 */
export type AddApiCallerContext<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? (context: ApiCallerContext, ...args: P) => R
    : T[K] extends object
      ? AddApiCallerContext<T[K]> // 关键递归逻辑
      : never
}

// 精确推导叶子函数路径
export type DeepFunctionPaths<T, ParentPath extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          T[K] extends (...args: any[]) => any
          ? `${ParentPath}${K}` // 捕获当前层函数
          : T[K] extends object
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type
              T[K] extends Array<any> | Date | Function
              ? never // 排除特殊类型
              : DeepFunctionPaths<T[K], `${ParentPath}${K}.`> // 继续递归
            : never
        : never
    }[keyof T]
  : never

// 最终导出类型
export type LeafFunctionPaths<T> = DeepFunctionPaths<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends Array<any> | Date ? never : T[K]
}>

// =========================自动生成 添加了API调用的上下文 参数的接口=========================
/**
 * 账号相关的API（添加API调用的上下文参数）
 */
export type GeneratedIpcToolkitAccountApi = AddApiCallerContext<ToolkitAccountApi>
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IpcToolkitAccountApi extends GeneratedIpcToolkitAccountApi {}

/**
 * 核心API（添加API调用的上下文参数）
 */
export type GeneratedIpcToolkitCoreApi = AddApiCallerContext<ToolkitCoreApi>
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IpcToolkitCoreApi extends GeneratedIpcToolkitCoreApi {}

/**
 * 自动生成 数据库API（添加API调用的上下文参数）
 */
export type GeneratedIpcToolkitDBApi = AddApiCallerContext<ToolkitDBApi>
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IpcToolkitDBApi extends GeneratedIpcToolkitDBApi {}

/**
 * 文件相关的API（添加API调用的上下文参数）
 */
export type GeneratedIpcToolkitFileApi = AddApiCallerContext<ToolkitFileApi>
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IpcToolkitFileApi extends GeneratedIpcToolkitFileApi {}

/**
 * 全局数据相关的API（添加API调用的上下文参数）
 */
export type GeneratedIpcToolkitGlobalApi = AddApiCallerContext<Omit<ToolkitGlobalDataApi, 'register'>>
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IpcToolkitGlobalApi extends GeneratedIpcToolkitGlobalApi {}

/**
 * 系统相关的API（添加API调用的上下文参数）
 */
export type GeneratedIpcToolkitSystemApi = AddApiCallerContext<ToolkitSystemApi>
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IpcToolkitSystemApi extends GeneratedIpcToolkitSystemApi {}

/**
 * 自动生成 窗口相关的API（添加API调用的上下文参数）
 */
export type GeneratedIpcToolkitWindowApi = AddApiCallerContext<ToolkitWindowApi>

/**
 * 窗口相关的API（添加API调用的上下文参数）
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IpcToolkitWindowApi extends GeneratedIpcToolkitWindowApi {}

/**
 * 自动生成 事件相关的API（添加API调用的上下文参数）
 */
export type GeneratedIpcToolkitEventApi = AddApiCallerContext<ToolkitEventApi>

/**
 * 事件相关的API（添加API调用的上下文参数）
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IpcToolkitEventApi extends GeneratedIpcToolkitEventApi {}
