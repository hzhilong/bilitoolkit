<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import PluginList from '@/renderer/components/plugin/PluginList.vue'
import { ref, computed, type Ref } from 'vue'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.ts'
import { usePluginStarsStore } from '@/renderer/stores/plugin-stars.ts'

const { state } = useAppInstalledPlugins()
const { hasStar } = usePluginStarsStore()

const checkboxGroup: Ref<string[]> = ref([])
const renderPlugins = computed(() => {
  if (checkboxGroup.value.includes('已收藏')) {
    return state.plugins.filter((plugin) => hasStar(plugin.id).value)
  }
  return state.plugins
})
const pluginCountDesc = computed(() => {
  return `已${checkboxGroup.value.includes('已收藏') ? '收藏' : '安装'}${renderPlugins.value.length}个插件`
})
</script>

<template>
  <PageContainer>
    <div class="header">
      <div>{{ pluginCountDesc }}</div>
      <el-checkbox-group v-model="checkboxGroup">
        <el-checkbox-button value="已收藏"> 已收藏 </el-checkbox-button>
      </el-checkbox-group>
    </div>
    <plugin-list class="list-container" :plugins="renderPlugins" :type="'manage'" />
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/plugin-manage';
</style>
