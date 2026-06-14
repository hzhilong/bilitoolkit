import { computed, watch, ref, toValue } from 'vue'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { getPluginIconCache } from '@/renderer/services/plugin-icon-service.js'
import type { MaybeRefOrGetter } from '@vueuse/core'
import { parsePluginIconUrl } from '@/shared/utils/plugin-parse'

const defaultIconSrc = new URL('/images/plugin-default-icon.png', import.meta.url).href

// 插件图标源，目前只支持 github仓库下 public/favicon.ico
export const usePluginIconURL = (plugin: MaybeRefOrGetter<ToolkitPlugin>) => {
  const iconUrl = computed(() => {
    return parsePluginIconUrl(toValue(plugin).id) ?? defaultIconSrc
  })
  return { iconUrl }
}

export const usePluginIconBase64 = (plugin: MaybeRefOrGetter<ToolkitPlugin>) => {
  const base64 = ref('')
  watch(
    () => toValue(plugin).id,
    async () => {
      base64.value = await getPluginIconCache(toValue(plugin))
    },
    { immediate: true },
  )

  return { base64 }
}
