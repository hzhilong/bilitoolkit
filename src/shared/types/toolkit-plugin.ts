/**
 * 插件定义的属性
 */
export interface ToolkitPlugin {
  // 插件id   package.name
  id: string
  // 插件名称 package.keywords.bilitoolkit-plugin:pluginName
  name: string
  // 作者 package.*
  author: string
  // 描述 package.*
  description: string
  // 版本号 package.*
  version: string
  // 发布时间 ISO 格式字符串
  date: string
  // 链接：homepage>repository>npm
  link: string
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

export interface PluginSearchResult {
  total: number
  time: string
  plugins: Array<ToolkitPlugin>
}
