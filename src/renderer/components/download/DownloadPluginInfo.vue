<script setup lang="ts">
import type { DownloadTask } from 'bilitoolkit-types'
import { useAppInstalledPlugins } from '@/renderer/stores/installed-plugins'
import { computed } from 'vue'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin'
import type { DownloadRecord } from '@/shared/types/download'
import { PluginUtils } from '@/renderer/utils/plugin-utils'

const props = withDefaults(
  defineProps<{
    task: DownloadTask
    hiddenBorder?: boolean
    canOpen?: boolean
  }>(),
  {
    hiddenBorder: false,
    canOpen: true,
  },
)

const { getInstalledPluginInfo } = useAppInstalledPlugins()
const plugin = computed<InstalledToolkitPlugin | undefined>(() => {
  const pluginId = (props.task as DownloadRecord).pluginId
  if (pluginId === 'core') return undefined
  return getInstalledPluginInfo(pluginId)
})
const styles = computed(() => {
  return {
    border: !props.hiddenBorder ? '1px solid var(--el-color-primary)' : 'none',
    borderRadius: !props.hiddenBorder ? '10px' : 'none',
    cursor: props.canOpen ? 'pointer' : 'unset',
  }
})
const handleClick = () => {
  if (props.canOpen && plugin.value) {
    PluginUtils.openPluginView(plugin.value)
  }
}
</script>

<template>
  <div class="download-plugin-info" v-if="plugin" @click="handleClick" :style="styles">
    {{ plugin.name }}
  </div>
</template>

<style scoped lang="scss">
.download-plugin-info {
  font-size: 12px;
  color: var(--el-color-primary);
  padding: 0 8px;
  cursor: pointer;
  margin-left: 10px;
  text-wrap: nowrap;
}
</style>
