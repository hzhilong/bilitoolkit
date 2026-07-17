/**
 * 开发者工具类型
 */
export enum DevToolsType {
  AUTO = '自动识别',
  MAIN = '主窗口',
  PLUGIN = '显示的插件',
  DIALOG = '全局对话框',
}
/**
 * 应用设置
 */
export interface AppSettings {
  devToolsType: DevToolsType
  // 卸载插件时删除浏览器 本地存储
  removeStorageOnUninstall: boolean
  // 卸载插件时删除文件、数据库等磁盘数据
  removeFilesOnUninstall: boolean
  // 启动时自动更新 APP
  autoUpdateOnStartup: boolean
}
