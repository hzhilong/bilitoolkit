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
  links: {
    npm: string
    homepage?: string
    repository?: string
    bugs?: string
  }
}

/**
 * 插件安装选项
 */
export interface PluginInstallOptions extends ToolkitPlugin {
  installDate: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isToolkitPlugin(obj: any): obj is ToolkitPlugin {
  return typeof obj === 'object' && obj !== null && 'links' in obj
}

export interface PluginSearchResult {
  total: number
  time: string
  plugins: Array<ToolkitPlugin>
}

/**
 * 已安装的插件
 */
export interface InstalledToolkitPlugin extends PluginInstallOptions {
  files: {
    // 文件根目录
    rootPath: string
    // dist 根目录
    distPath: string
    // 主页路径
    indexPath: string
    // 插件文件总大小 KB
    size: number
    // 插件文件总大小描述，带单位
    sizeDesc: string
  }
  // 插件加载出现错误？（需要重装）
  // loadingError?: CommonError
}

/**
 * 应用已安装的插件
 */
export interface AppInstalledPlugins {
  appVersion: string
  plugins: Map<string, InstalledToolkitPlugin>
}
