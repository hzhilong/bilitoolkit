import type { ToolkitApi } from 'bilitoolkit-types'
import type {
  AppInstalledPlugins,
  InstalledToolkitPlugin,
  PluginInstallOptions,
  PluginTestOptions,
  ToolkitPlugin,
} from '@/shared/types/toolkit-plugin.js'
import type { ToolkitTaskApi } from '@/shared/types/toolkit-task-api.js'
import type { UserInfoWithCookie } from '@ybgnb/bili-api'

/**
 * 哔哩工具姬API（包含核心API）
 */
export interface ToolkitApiWithCore extends ToolkitApi {
  /**
   * 软件核心相关API
   */
  core: ToolkitCoreApi
  /**
   * 任务相关API
   */
  task: ToolkitTaskApi
}

/**
 * 哔哩工具姬 API的模块分类
 */
export type ToolkitApiModule = keyof ToolkitApiWithCore

// 通用的“精简上下文”（宿主环境的全局数据或者事件监听时会回调）
export type ApiCallerIdentity = { envType: 'plugin'; plugin: ToolkitPlugin } | { envType: 'host' }

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
   * 获取已安装的插件
   */
  getInstalledPlugins(): Promise<AppInstalledPlugins>

  /**
   * 获取推荐的插件
   */
  getRecommendedPlugins(): Promise<ToolkitPlugin[]>

  /**
   * 获取屏蔽的插件id
   */
  getBlockedPluginIds(): Promise<string[]>

  /**
   * 安装插件
   */
  installPlugin(options: PluginInstallOptions): Promise<InstalledToolkitPlugin>

  /**
   * 更新插件
   */
  updatePlugin(plugin: InstalledToolkitPlugin): Promise<InstalledToolkitPlugin>

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
   * 加载测试插件
   */
  loadTestPlugin(options: PluginTestOptions): Promise<InstalledToolkitPlugin>
  /**
   * 隐藏应用对话框窗口
   */
  hideAppDialogWindow(): Promise<void>

  /**
   * 获取插件图标（base64）
   */
  getPluginIcon(plugin: ToolkitPlugin): Promise<string>

  /**
   * 清理插件图标缓存
   */
  clearPluginIconCache(): Promise<void>

  /**
   * 同步用户列表
   */
  syncUserList(users: UserInfoWithCookie[]): Promise<UserListSyncResult>
}

/**
 * 用户列表刷新结果
 */
export interface UserListSyncResult {
  // 已更新的信息
  updatedList: UserInfoWithCookie[]
  // 已失效的信息
  expiredList: UserInfoWithCookie[]
}
