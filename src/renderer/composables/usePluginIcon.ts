import { computed, watch, ref, type Reactive, isReactive, isRef } from 'vue'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { parseGithubRepo } from '@/shared/utils/github-parse.ts'
import { getPluginIconCache } from '@/renderer/services/plugin-icon-service.ts'

const defaultIconSrc = new URL('/images/plugin-default-icon.png', import.meta.url).href

// 插件图标源，目前只支持 github仓库下 public/favicon.ico
export const usePluginIconURL = (plugin: Reactive<ToolkitPlugin>) => {
  const iconUrl = computed(() => {
    const repository = plugin.links.repository
    if (!repository) {
      return defaultIconSrc
    }
    try {
      const { owner, repo, branch } = parseGithubRepo(repository)
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public/favicon.ico`
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_ignored) {
      return defaultIconSrc
    }
  })
  return { iconUrl }
}

export const usePluginIconBase64 = (plugin: Reactive<ToolkitPlugin> | ToolkitPlugin) => {
  const base64 = ref('')
  if (isReactive(plugin) || isRef(plugin)) {
    watch(
      plugin,
      async (newVal) => {
        const current = newVal
        const result = await getPluginIconCache(current)
        if (plugin === current) {
          base64.value = result
        }
      },
      { immediate: true },
    )
  } else {
    getPluginIconCache(plugin).then((data) => {
      base64.value = data
    })
  }

  return { base64 }
}
