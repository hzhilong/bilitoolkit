import type {
  PluginTestOptions,
  InstalledToolkitPlugin,
  PluginDownloadOptions,
  RecommendedPlugins,
} from '@/shared/types/toolkit-plugin.js'
import {
  getFormattedDate,
  getErrorMessage,
  getGithubRawJson,
  parseGithubRepoUrl,
  parseGithubRawUrl,
  fetchWithFormat,
} from '@ybgnb/utils'
import { parsePluginKeywords } from '@/shared/utils/plugin-parse.js'
import path from 'path'
import fs from 'fs'
import type { PackageJSON } from '@npm/types'
import { IconUtils } from '@/main/utils/icon.js'
import { writeFileSync } from 'node:fs'
import { mainEnv } from '@/main/common/main-env.js'
import { mainLogger } from '@/main/common/main-logger.js'
import { appPath } from '@/main/common/app-path.js'
import DBUtils from '@/main/utils/db.js'
import type { TaskPluginInfo } from '@/shared/types/task.js'
import { loadTaskPluginMeta } from '@/main/plugin/task/loader.js'
import { readJSONFile, getDirSize, formatFileSizeFromKB, emptyDirectory } from '@ybgnb/utils/node'
import { getFileRootPath } from '@/main/utils/file.js'
import { AppError } from 'bilitoolkit-types'

/**
 * 读取插件的 package.json
 * @param pluginRootPath 插件根目录
 */
export function readPluginPackage(pluginRootPath: string) {
  return readJSONFile<PackageJSON>(path.join(pluginRootPath, 'package.json'))
}

/**
 * 加载已安装的插件
 * @param options   插件下载选项
 * @param cacheIcon 是否缓存图标
 */
export async function loadInstalledPlugin(
  options: PluginDownloadOptions,
  cacheIcon: boolean = true,
): Promise<InstalledToolkitPlugin | TaskPluginInfo> {
  const size = (await getDirSize(options.rootDirPath)) / 1024
  const sizeDesc = formatFileSizeFromKB(size)
  const installed = {
    ...options,
    files: {
      rootPath: options.rootDirPath,
      distPath: path.join(options.rootDirPath, 'dist'),
      indexPath: path.join(options.rootDirPath, 'dist', options.type === 'ui' ? 'index.html' : 'index.js'),
      size: size,
      sizeDesc: sizeDesc,
    },
  } satisfies InstalledToolkitPlugin
  if (cacheIcon) {
    const icon = IconUtils.getInstalledPluginIcon(installed)
    const iconCachePath = IconUtils.getPluginIconCachePath(options.id)
    writeFileSync(iconCachePath, icon, 'utf8')
  }
  if (installed.type === 'task') {
    Object.assign(installed as TaskPluginInfo, await loadTaskPluginMeta(installed))
  }
  return installed
}

/**
 * 加载测试插件
 * @param options 插件测试选项
 */
export async function loadTestPlugin({ pluginPath }: PluginTestOptions): Promise<InstalledToolkitPlugin> {
  if (/^https?:\/\//i.test(pluginPath)) {
    return loadTestUIPluginByUrl(pluginPath)
  }
  if (!path.isAbsolute(pluginPath)) {
    throw new AppError('请输入已构建的项目路径或者访问地址')
  }
  return loadTestPluginByFile(pluginPath)
}

/**
 * 加载 ui 测试插件（开发服务器）
 * @param devUrl  开发服务器访问地址
 */
function loadTestUIPluginByUrl(devUrl: string): InstalledToolkitPlugin {
  return {
    id: `test-${Math.floor(Date.now() / 1000)}`,
    name: `测试-${Math.floor(Date.now() / 1000)}`,
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
async function loadTestPluginByFile(rootPath: string): Promise<InstalledToolkitPlugin | TaskPluginInfo> {
  const pkg = await readPluginPackage(rootPath)
  const { name, type } = parsePluginKeywords(pkg.name, pkg.keywords)
  const distPath = path.join(rootPath, 'dist')
  const indexName = type === 'ui' ? 'index.html' : 'index.js'
  const indexPath = path.join(distPath, indexName)

  if (!fs.existsSync(indexPath)) {
    throw new AppError(`项目未打包，不存在文件/dist/${indexName}`)
  }

  const plugin = {
    id: pkg.name,
    name: name,
    type: type,
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
      distPath: distPath,
      indexPath: indexPath,
      size: 0,
      sizeDesc: 'test',
    },
    isTest: true,
  }

  if (plugin.type === 'task') {
    Object.assign(plugin as TaskPluginInfo, await loadTaskPluginMeta(plugin))
  }
  return plugin
}

/**
 * 移除测试的插件
 */
export async function removeTestPlugin(plugin: InstalledToolkitPlugin) {
  await emptyDirectory(DBUtils.getDBPath('plugin', plugin))
  await emptyDirectory(getFileRootPath('plugin', plugin))
}

/**
 * 获取推荐的插件
 */
export async function getRecommendedPlugins() {
  try {
    // 先尝试从github仓库下载
    const repo = parseGithubRepoUrl(mainEnv.APP_REPO_URL)
    const recommendedPlugins = await fetchWithFormat<RecommendedPlugins>(
      parseGithubRawUrl({ ...repo, filePath: 'public/recommended-plugins.json' }),
      'json',
    )
    return recommendedPlugins.plugins
  } catch (error: unknown) {
    mainLogger.error('获取推荐的插件失败', getErrorMessage(error))
    // 加载本地文件（该版本app推荐的插件）
    return (await readJSONFile<RecommendedPlugins>(path.join(appPath.appPublicPath, 'recommended-plugins.json')))
      .plugins
  }
}

/**
 * 获取屏蔽的插件id
 */
export async function getBlockedPluginIds() {
  try {
    // 先尝试从github仓库下载
    const repo = parseGithubRepoUrl(mainEnv.APP_REPO_URL)
    const json = await fetchWithFormat(
      parseGithubRawUrl({ ...repo, filePath: 'public/blocklist-plugins.json' }),
      'text',
    )
    return JSON.parse(json) as string[]
  } catch (error: unknown) {
    mainLogger.error('获取屏蔽的插件id失败', getErrorMessage(error))
    // 加载本地文件（该版本app推荐的插件）
    return await readJSONFile<string[]>(path.join(appPath.appPublicPath, 'blocklist-plugins.json'))
  }
}
