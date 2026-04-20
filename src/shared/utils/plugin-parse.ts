import type { PluginType } from '@/shared/types/toolkit-plugin.ts'
import { pluginKeywordsPrefix } from '@/shared/common/plugin-keywords.ts'

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
  // TODO 初版规则，后续移除
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
