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
}
