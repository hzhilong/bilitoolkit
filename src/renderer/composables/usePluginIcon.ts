import { type ToRefs, computed } from 'vue'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { parseGithubRepo } from '@/shared/utils/github-parse.ts'

const defaultIconSrc = new URL('/images/plugin-default-icon.png', import.meta.url).href

// 插件图标源，目前只支持 github仓库下 public/favicon.ico
export const usePluginIconSrc = (plugin: ToRefs<ToolkitPlugin>) => {
  const iconSrc = computed(() => {
    const repository = plugin.links.value.repository
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
  return { iconSrc }
}
