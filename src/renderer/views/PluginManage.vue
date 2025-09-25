<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import PluginList from '@/renderer/components/plugin/PluginList.vue'
import { ref, computed } from 'vue'
import { useLoadingData } from 'bilitoolkit-ui'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.ts'

const { loading } = useLoadingData()
const { state } = useAppInstalledPlugins()
const plugins = state.plugins
const pluginCount = computed(() => state.plugins.length)
</script>

<template>
  <PageContainer v-loading="loading">
    <div class="header">
      <div>已安装{{ pluginCount }}个插件</div>
    </div>
    <plugin-list class="list-container" :plugins="plugins" :type="'manage'" />
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/plugin-manage';
</style>
