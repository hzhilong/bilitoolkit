import { app } from 'electron'
import path from 'path'
import { FileUtils } from '@/main/utils/file-utils.ts'

/**
 * 应用相关路径数据
 *
 * app.getAppPath()
 *    dev：E:\Projects\io.github.hzhilong\app-data-backup
 *    pro:
 *      asar: E:\Projects\io.github.hzhilong\app-data-backup\release\0.0.1\win-unpacked\resources\app.asar
 *      !asar: E:\Projects\io.github.hzhilong\app-data-backup\release\0.0.1\win-unpacked\resources\app
 *
 * app.getPath('exe')
 *    dev：E:\Projects\io.github.hzhilong\app-data-backup\node_modules\electron\dist\electron.exe
 *    pro: E:\Projects\io.github.hzhilong\app-data-backup\release\0.0.1\win-unpacked\软件数据备份.exe
 */

/**
 * 开发环境 url
 */
const devUrl = process.env.VITE_DEV_SERVER_URL || ''
/**
 * 获取应用根目录  开发：项目路径 / 生产： 启用了asar：返回app.asar所在目录 / 未启用asar：安装后的app目录
 */
const appRootPath = app.getAppPath()
/**
 * 获取程序根目录  开发：项目路径 / 生产：安装路径
 */
const programRoot = devUrl ? appRootPath : path.dirname(app.getPath('exe'))
/**
 * 构建后的资源路径（开发环境不要使用）
 */
const appResourcesPath = path.dirname(appRootPath)
/**
 * 前端代码打包后的目录（渲染进程）
 */
const appRendererDist = path.join(appRootPath, 'dist')
/**
 * Electron代码打包的目录（主进程）
 */
const appMainDist = path.join(appRootPath, 'dist-electron')
/**
 * 静态资源目录 开发环境直接取根目录下的 public
 */
const appPublicPath = devUrl ? path.join(appRootPath, 'public') : appRendererDist

/**
 * 打包后的preload.js 路径
 */
const preloadJS = path.join(appMainDist, 'preload.js')

/**
 * 打包后的index.html路径
 */
const indexHtml = path.join(appRendererDist, 'index.html')
/**
 * 应用加载路径
 */
const appURL = devUrl ? devUrl : indexHtml
/**
 * 总的日志路径
 */
const logsPath = path.join(programRoot, 'logs')
/**
 * 数据库路径
 */
const dbPath = path.join(programRoot, 'dbs')
FileUtils.ensureDirExists(dbPath)
/**
 * 文件路径
 */
const filePath = path.join(programRoot, 'files')
FileUtils.ensureDirExists(filePath)
/**
 * 主应用文件路径
 */
const hostAppFilePath =  FileUtils.getPluginRootPath('host')
FileUtils.ensureDirExists(hostAppFilePath)
/**
 * 插件目录
 */
const pluginsPath = path.join(programRoot, 'plugins')
FileUtils.ensureDirExists(pluginsPath)

/**
 * 默认窗口图标
 */
const defaultWindowIcon = path.join(appPublicPath, 'favicon.ico')
/**
 * preloads目录
 */
const preloadsDir = path.join(appPublicPath, 'preloads')
/**
 * 默认的插件图标路径
 */
const defaultPluginIcon = path.join(appPublicPath, 'images/plugin-default-icon.png')
/**
 * 插件图标根路径
 */
const pluginIcons = path.join(programRoot, 'plugin-icons')
FileUtils.ensureDirExists(pluginIcons)
/**
 * 临时目录
 */
const temp = path.join(programRoot, 'temp')
FileUtils.ensureDirExists(temp)

export const appPath = {
  devUrl,
  appRootPath,
  programRoot,
  appResourcesPath,
  appRendererDist,
  appMainDist,
  appPublicPath,
  preloadJS,
  indexHtml,
  appURL,
  defaultWindowIcon,
  logsPath,
  dbPath,
  filePath,
  hostAppFilePath,
  pluginsPath,
  preloadsDir,
  defaultPluginIcon,
  pluginIcons,
  temp,
}
