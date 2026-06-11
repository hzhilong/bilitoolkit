import { computed, watch, ref, toValue } from 'vue'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { getPluginIconCache } from '@/renderer/services/plugin-icon-service.js'
import { parseGithubRepoUrl } from '@ybgnb/utils'
import type { MaybeRefOrGetter } from '@vueuse/core'

const defaultIconSrc = new URL('/images/plugin-default-icon.png', import.meta.url).href

// 插件图标源，目前只支持 github仓库下 public/favicon.ico
export const usePluginIconURL = (plugin: MaybeRefOrGetter<ToolkitPlugin>) => {
  const iconUrl = computed(() => {
    const repository = toValue(plugin).links.repository
    if (!repository) {
      return defaultIconSrc
    }
    try {
      const { owner, repo, branch } = parseGithubRepoUrl(repository)
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public/favicon.ico`
    } catch {
      return defaultIconSrc
    }
  })
  return { iconUrl }
}

export const usePluginIconBase64 = (plugin: MaybeRefOrGetter<ToolkitPlugin>) => {
  const base64 = ref('')
  watch(
    () => toValue(plugin).id,
    async () => {
      const result = await getPluginIconCache(toValue(plugin))
      console.log('获取图标完成')
      base64.value = result
    },
    { immediate: true },
  )

  return { base64 }
}
