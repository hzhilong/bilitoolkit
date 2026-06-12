<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import PluginListSimple from '@/renderer/components/plugin/PluginListSimple.vue'
import type { InstalledToolkitPlugin, ToolkitPlugin } from '@/shared/types/toolkit-plugin'
import { PluginUtils } from '@/renderer/utils/plugin-utils'
import { useRecentPluginsStore } from '@/renderer/stores/recent-plugins'
import { IconButton } from 'bilitoolkit-ui'
import { storeToRefs } from 'pinia'

const recentPluginsStore = useRecentPluginsStore()
const { recentPlugins } = storeToRefs(recentPluginsStore)
const { removeRecent } = recentPluginsStore

const handleItemClick = (plugin: ToolkitPlugin) => {
  PluginUtils.openPluginView(plugin as InstalledToolkitPlugin)
}
const handleRemove = (plugin: ToolkitPlugin) => {
  removeRecent(plugin.id)
}
</script>

<template>
  <PageContainer>
    <div v-if="recentPlugins.length" class="list-wrapper">
      <plugin-list-simple :plugins="recentPlugins" @click="handleItemClick">
        <template v-slot="{ plugin }">
          <IconButton class="options-close-btn" icon="logout-box-r" tip="删除" @click="handleRemove(plugin)" />
        </template>
      </plugin-list-simple>
    </div>
    <el-empty v-else description="暂无最近使用记录"></el-empty>
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/recent-plugins';
</style>
