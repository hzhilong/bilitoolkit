<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import PluginList from '@/renderer/components/plugin/PluginList.vue'
import { ref, computed, watch } from 'vue'
import { useAppInstalledPlugins } from '@/renderer/stores/installed-plugins'
import { useStarredPluginsStore } from '@/renderer/stores/starred-plugins'
import PluginListSimple from '@/renderer/components/plugin/PluginListSimple.vue'
import type { InstalledToolkitPlugin, ToolkitPlugin, PluginType } from '@/shared/types/toolkit-plugin'
import { PluginUtils } from '@/renderer/utils/plugin-utils'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

const { state } = storeToRefs(useAppInstalledPlugins())
const { isStarred } = useStarredPluginsStore()
const route = useRoute()
const isShowStarred = ref(false)
const isDetailedView = ref(false)
const showType = ref<'' | PluginType>('')

watch(
  () => [route.query.starred, route.query.type],
  ([starred, type]) => {
    isShowStarred.value = !!starred
    showType.value = (type as PluginType) || ''
  },
  {
    immediate: true,
  },
)

const renderPlugins = computed(() => {
  return state.value.plugins.filter((plugin) => {
    if (isShowStarred.value && !isStarred(plugin.id)) {
      return false
    }
    if (showType.value && plugin.type !== showType.value) {
      return false
    }
    return true
  })
})
const pluginCountDesc = computed(() => {
  return `已${isShowStarred.value ? '收藏' : '安装'}${renderPlugins.value.length}个插件`
})
const handleItemClick = (plugin: ToolkitPlugin) => {
  PluginUtils.openPluginView(plugin as InstalledToolkitPlugin)
}
</script>

<template>
  <PageContainer>
    <div class="header">
      <div>{{ pluginCountDesc }}</div>
      <div class="actions">
        <el-radio-group v-model="isShowStarred" size="small">
          <el-radio-button label="全部" :value="false" />
          <el-radio-button label="已收藏" :value="true" />
        </el-radio-group>
        <el-radio-group v-model="isDetailedView" size="small">
          <el-radio-button label="简略视图" :value="false" />
          <el-radio-button label="详细视图" :value="true" />
        </el-radio-group>
        <el-radio-group v-model="showType" size="small">
          <el-radio-button label="全部" value="" />
          <el-radio-button label="ui 插件" value="ui" />
          <el-radio-button label="定时任务插件" value="task" />
        </el-radio-group>
      </div>
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
