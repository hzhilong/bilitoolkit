import type { PluginType, ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { pluginKeywordsPrefix } from '@/shared/common/plugin-keywords.js'
import type { SearchResultPackage, NpmPackage } from 'public-registry-api'
import { getFormattedDate } from '@ybgnb/utils'
import type { PackageJSON } from '@npm/types'

export const parsePluginManifest = (pkg: PackageJSON, fallbackAuthor = '') => ({
  ...parsePluginKeywords(pkg.name, pkg.keywords),
  version: pkg.version,
  description: pkg.description || '',
  author: typeof pkg.author === 'string' ? pkg.author : pkg.author?.name || fallbackAuthor,
  links: {
    npm: `https://www.npmjs.com/package/${pkg.name}`,
    homepage: pkg.homepage,
    repository: typeof pkg.repository === 'object' ? pkg.repository.url : pkg.repository,
    repositoryDir: typeof pkg.repository === 'object' ? pkg.repository.directory : undefined,
    bugs: typeof pkg.bugs === 'object' ? pkg.bugs.url : pkg.bugs,
  },
})

/**
 * 解析插件关键词
 */
export const parsePluginKeywords = (id: string, keywords: string[] | undefined): { name: string; type: PluginType } => {
  if (!keywords) {
    return {
      name: id,
      type: 'ui',
    }
  }
  let name: string = ''
  let type: string = 'ui'
  // 初版规则，后续移除
  let nameV1: string = ''
  const nameV1Prefix = 'bilitoolkit-plugin:'

  for (const keyword of keywords) {
    if (keyword.startsWith(pluginKeywordsPrefix.name) && keyword.length > pluginKeywordsPrefix.name.length) {
      name = keyword.substring(pluginKeywordsPrefix.name.length)
    }
    if (keyword.startsWith(pluginKeywordsPrefix.type) && keyword.length > pluginKeywordsPrefix.type.length) {
      type = keyword.substring(pluginKeywordsPrefix.name.length)
    }

    if (keyword.startsWith(nameV1Prefix) && nameV1Prefix.split(':').length === 2) {
      nameV1 = keyword.substring(nameV1Prefix.length)
    }
  }
  if (type !== 'ui' && type !== 'task') type = 'ui'

  return {
    name: name || nameV1 || id,
    type: type as PluginType,
  }
}

/**
 * 解析 npm 搜索结果的包
 */
export const parseNpmSearchResultPkg = (pkg: SearchResultPackage) => {
  return {
    ...parsePluginKeywords(pkg.name, pkg.keywords),
    id: pkg.name,
    author: pkg.publisher.username,
    description: pkg.description ?? '',
    version: pkg.version,
    date: getFormattedDate(new Date(pkg.date)),
    links: pkg.links,
  } satisfies ToolkitPlugin
}

/**
 * 解析 npm 包（版本获取最新的）
 */
export const parseNpmPackage = (pkg: NpmPackage) => {
  const latestVersion = pkg['dist-tags'].latest
  const manifest = pkg.versions[latestVersion]
  if (!manifest) throw new Error(`npm 包缺少 latest 版本: ${pkg.name}`)
  return {
    ...parsePluginKeywords(pkg.name, manifest.keywords),
    id: pkg.name,
    author: typeof manifest.author === 'string' ? manifest.author : (manifest.author?.name ?? ''),
    description: manifest.description ?? '',
    version: latestVersion,
    date: getFormattedDate(new Date(pkg.time[latestVersion] || pkg.time.created)),
    links: {
      npm: `https://www.npmjs.com/package/${pkg.name}`,
      homepage: manifest.homepage,
      repository: manifest.repository?.url,
      repositoryDir: manifest.repository?.directory,
      bugs: manifest.bugs?.url,
    },
  } satisfies ToolkitPlugin
}

/**
 * 解析插件图标 url
 */
export const parsePluginIconUrl = (pluginId: string) => {
  //  return `https://unpkg.com/${pluginId}/dist/icon.png`
  return `https://cdn.jsdelivr.net/npm/${pluginId}@latest/dist/icon.png`
}
