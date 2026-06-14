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
    repositoryDir?: string
    bugs?: string
  }
  type: PluginType
}

// 插件任务类型
export type PluginType = 'ui' | 'task'

export interface ToolkitPluginWithNpmInfo extends ToolkitPlugin {
  downloads: {
    monthly: number
    weekly: number
  }
  searchScore: number
}

/**
 * 插件安装选项
 */
export interface PluginInstallOptions extends ToolkitPlugin {
  // 安装日期
  installDate: string
}

/**
 * 插件下载选项
 */
export interface PluginDownloadOptions extends PluginInstallOptions {
  // 插件根目录
  rootDirPath: string
  // 插件目录名
  pluginDirName: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isToolkitPlugin(obj: any): obj is ToolkitPlugin {
  return typeof obj === 'object' && obj !== null && 'links' in obj
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
  // 是否为测试插件
  isTest?: boolean
  // 插件加载出现错误？（需要重装）
  // loadingError?: Error
}

export function isInstalledToolkitPlugin(obj: ToolkitPlugin): obj is InstalledToolkitPlugin {
  return typeof obj === 'object' && obj !== null && 'files' in obj
}

/**
 * 应用已安装的插件
 */
export interface AppInstalledPlugins {
  appVersion: string
  plugins: Array<InstalledToolkitPlugin>
}

/**
 * 应用推荐的插件
 */
export interface RecommendedPlugins {
  appVersion: string
  plugins: Array<ToolkitPlugin>
}

/**
 * 插件测试选项
 */
export interface PluginTestOptions {
  /** 插件地址，开发服务器访问地址 / 本地已打包的开发项目根目录 */
  pluginPath: string
}
