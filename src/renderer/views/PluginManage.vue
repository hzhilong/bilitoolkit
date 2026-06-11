<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import PluginList from '@/renderer/components/plugin/PluginList.vue'
import { ref, computed } from 'vue'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.js'
import { usePluginStarsStore } from '@/renderer/stores/plugin-stars.js'
import PluginListSimple from '@/renderer/components/plugin/PluginListSimple.vue'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin'
import { PluginUtils } from '@/renderer/utils/plugin-utils'

const { state } = useAppInstalledPlugins()
const { hasStar } = usePluginStarsStore()

const isFavView = ref(false)
const isDetailedView = ref(false)
const renderPlugins = computed(() => {
  if (isFavView.value) {
    return state.plugins.filter((plugin) => hasStar(plugin.id).value)
  }
  return state.plugins
})
const pluginCountDesc = computed(() => {
  return `已${isFavView.value ? '收藏' : '安装'}${renderPlugins.value.length}个插件`
})
const handleItemClick = (plugin: ToolkitPlugin) => {
  PluginUtils.openPluginView(plugin)
}
</script>

<template>
  <PageContainer>
    <div class="header">
      <div>{{ pluginCountDesc }}</div>
      <el-checkbox v-model="isFavView" label="显示已收藏" />
      <el-checkbox v-model="isDetailedView" label="详细视图" />
    </div>
    <div class="list-wrapper">
      <plugin-list v-if="isDetailedView" :plugins="renderPlugins" :type="'manage'" />
      <plugin-list-simple v-else :plugins="renderPlugins" @click="handleItemClick" />
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/plugin-manage';
</style>
