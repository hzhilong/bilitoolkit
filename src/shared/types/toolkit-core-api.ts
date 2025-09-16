import type { ToolkitApi } from 'bilitoolkit-api-types'
import type { PluginInstallOptions, ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

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

  /**
   * 打开数据库文件夹
   */
  openDBsFolder(): Promise<void>

  /**
   * 打开用户文件夹
   */
  openFilesFolder(): Promise<void>

  /**
   * 获取日志文件夹大小
   */
  getLogsFolderSize(): Promise<string>

  /**
   * 获取数据库文件夹大小
   */
  getDBsFolderSize(): Promise<string>

  /**
   * 获取用户文件夹大小
   */
  getFilesFolderSize(): Promise<string>

  /**
   * 账号变更，通知主进程的哔哩账号管理模块变更
   */
  updatedLoggedInAccounts(): Promise<void>

  /**
   * 获取已安装的插件
   */
  getInstalledPlugins(): Promise<ToolkitPlugin[]>

  /**
   * 安装插件
   */
  installPlugin(options: PluginInstallOptions): Promise<ToolkitPlugin>

  /**
   * 卸载插件
   */
  uninstallPlugin(id: string): Promise<void>

  /**
   * 打开插件（对于未关闭的插件会进行复用）
   */
  openPlugin(plugin: ToolkitPlugin): Promise<void>

  /**
   * 关闭插件
   */
  closePlugin(plugin: ToolkitPlugin): Promise<void>

  /**
   * 隐藏当前插件View
   */
  hideCurrPlugin(): Promise<void>
  /**
   * 隐藏应用对话框窗口
   */
  hideAppDialogWindow(): Promise<void>
}
