/**
 * 插件定义的属性
 */
export interface ToolkitPlugin {
  // 插件id   package.name
  id: string
  // 插件名称 package.pluginName
  name: string
  // 作者 package.*
  // author: string
  // 描述 package.*
  // description: string
  // 图标 package.*   url或者本地相对路径
  // icon: string
  // 版本 package.*
  // version: string
  // 插件主页
  // homePage: string
  // index 路径
  indexPath: string
}

/**
 * 插件安装选项
 */
export interface PluginInstallOptions {
  id: string
  version?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isToolkitPlugin(obj: any): obj is ToolkitPlugin {
  return typeof obj === 'object'
    && obj !== null
    && 'indexPath' in obj
}
