<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import PluginList from '@/renderer/components/plugin/PluginList.vue'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { ref } from 'vue'
import { PluginUtils } from '@/renderer/utils/plugin-utils.ts'

const plugins = ref<ToolkitPlugin[]>([])
const pluginCount = ref(0)
const refreshList = async () => {
  const searchResult = await PluginUtils.searchPlugins()
  // plugins.value = searchResult.plugins
  for (let i = 0; i < 20; i++) {
    plugins.value.push(...searchResult.plugins)
  }
  pluginCount.value = searchResult.total
}
</script>

<template>
  <PageContainer>
    <div class="header">
      <div>目前共有{{pluginCount}}个插件</div>
      <el-button @click="refreshList">刷新</el-button>
    </div>
    <plugin-list class="list-container" :plugins="plugins" />
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/plugin-market';
</style>
