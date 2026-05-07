import { toolkitApi } from '@/renderer/api/toolkit-api'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'

/**
 * 应用推荐的插件
 */
export const useRecommendedPlugins = defineStore(
  'BiliToolkit-RecommendedPlugins',
  () => {
    const plugins: Ref<ToolkitPlugin[]> = ref<ToolkitPlugin[]>([])

    const init = async () => {
      plugins.value = Array.from(await toolkitApi.core.getRecommendedPlugins())
    }

    return { init, plugins }
  },
  {
    persist: false,
  },
)
