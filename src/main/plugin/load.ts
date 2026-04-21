import type {
  PluginTestOptions,
  InstalledToolkitPlugin,
  PluginDownloadOptions,
  ToolkitPlugin,
} from '@/shared/types/toolkit-plugin.ts'
import { generateId } from '@/main/utils/id.ts'
import { getFormattedDate, parseGithubRepo, getErrorMessage } from '@ybgnb/utils'
import { parsePluginKeywords } from '@/shared/utils/plugin-parse.ts'
import path from 'path'
import fs from 'fs'
import type { PackageJSON } from '@npm/types'
import { FileUtils } from '@/main/utils/file.ts'
import { IconUtils } from '@/main/utils/icon.ts'
import { writeFileSync } from 'node:fs'
import { mainEnv } from '@/main/common/main-env.ts'
import { GithubUtils } from '@/main/utils/github.ts'
import { mainLogger } from '@/main/common/main-logger.ts'
import { appPath } from '@/main/common/app-path.ts'
import DBUtils from '@/main/utils/db.ts'

/**
 * 读取插件的 package.json
 * @param pluginRootPath 插件根目录
 */
export function readPluginPackage(pluginRootPath: string) {
  return FileUtils.readJsonFile<PackageJSON>(path.join(pluginRootPath, 'package.json'))
}

/**
 * 加载已安装的插件
 * @param options   插件下载选项
 * @param cacheIcon 是否缓存图标
 */
export function loadInstalledPlugin(options: PluginDownloadOptions, cacheIcon: boolean = true): InstalledToolkitPlugin {
  const size = FileUtils.getFolderSizeSync(options.rootDirPath) / 1024
  const sizeDesc = FileUtils.formatKBSize(size)
  const installed = {
    ...options,
    files: {
      rootPath: options.rootDirPath,
      distPath: path.join(options.rootDirPath, 'dist'),
      indexPath: path.join(options.rootDirPath, 'dist', 'index.html'),
      size: size,
      sizeDesc: sizeDesc,
    },
  } satisfies InstalledToolkitPlugin
  if (cacheIcon) {
    const icon = IconUtils.getInstalledPluginIcon(installed)
    const iconCachePath = IconUtils.getPluginIconCachePath(options.id)
    writeFileSync(iconCachePath, icon, 'utf8')
  }
  return installed
}

/**
 * 加载测试插件
 * @param options 插件测试选项
 */
export function loadTestPlugin({ pluginPath }: PluginTestOptions): InstalledToolkitPlugin {
  if (/^https?:\/\//i.test(pluginPath)) {
    return loadTestUIPluginByUrl(pluginPath)
  }
  if (!path.isAbsolute(pluginPath)) {
    throw new Error('请输入已构建的项目路径或者访问地址')
  }
  return loadTestPluginByFile(pluginPath)
}

/**
 * 加载 ui 测试插件（开发服务器）
 * @param devUrl  开发服务器访问地址
 */
function loadTestUIPluginByUrl(devUrl: string): InstalledToolkitPlugin {
  return {
    id: `test-${generateId()}`,
    name: '测试',
    type: 'ui',
    author: 'dev',
    description: 'test',
    version: '0.0.1',
    date: getFormattedDate(),
    links: {
      npm: '',
    },
    installDate: getFormattedDate(),
    files: {
      rootPath: devUrl,
      distPath: devUrl,
      indexPath: devUrl,
      size: 0,
      sizeDesc: 'test',
    },
    isTest: true,
  }
}

/**
 * 加载测试插件（本地项目）
 * @param rootPath  本地已打包的开发项目根目录
 */
function loadTestPluginByFile(rootPath: string) {
  const packageJSON = readPluginPackage(rootPath)
  const { name, type } = parsePluginKeywords(packageJSON.name, packageJSON.keywords)

  if (type === 'task') {
    // TODO 支持测试任务插件
    throw new Error('暂不支持测试任务插件')
  } else {
    return loadTestUIPluginByFile(rootPath, packageJSON, name)
  }
}

/**
 * 加载 ui 测试插件（本地项目）
 */
function loadTestUIPluginByFile(rootPath: string, pkg: PackageJSON, name: string): InstalledToolkitPlugin {
  const indexPath = path.join(rootPath, 'dist', 'index.html')
  if (!fs.existsSync(indexPath)) {
    throw new Error('项目未打包，不存在文件/dist/index.html')
  }

  return {
    id: pkg.name,
    name: name,
    type: 'ui',
    author: pkg.author ? String(pkg.author) : '',
    description: pkg.description ?? '',
    version: pkg.version,
    date: getFormattedDate(),
    links: {
      npm: '',
    },
    installDate: getFormattedDate(),
    files: {
      rootPath: rootPath,
      distPath: path.join(rootPath, 'dist'),
      indexPath: indexPath,
      size: 0,
      sizeDesc: 'test',
    },
    isTest: true,
  }
}

/**
 * 移除测试的插件
 */
export function removeTestPlugin(plugin: InstalledToolkitPlugin) {
  FileUtils.deleteFilesInDirectory(DBUtils.getPluginDBPath('plugin', plugin))
  FileUtils.deleteFilesInDirectory(FileUtils.getPluginRootPath('plugin', plugin))
}

/**
 * 加载推荐的插件
 */
export async function getRecommendedPlugins() {
  try {
    // 先尝试从github仓库下载
    const repo = parseGithubRepo(mainEnv.env.APP_REPO_URL)
    return await GithubUtils.getRawJson<ToolkitPlugin[]>(repo, 'public/recommended-plugins.json')
  } catch (error: unknown) {
    mainLogger.error('获取推荐的插件失败', getErrorMessage(error))
    // 加载本地文件（该版本app推荐的插件）
    return FileUtils.readJsonFile<ToolkitPlugin[]>(path.join(appPath.appPublicPath, 'recommended-plugins.json'))
  }
}
