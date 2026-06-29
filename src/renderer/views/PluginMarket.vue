<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import PluginList from '@/renderer/components/plugin/PluginList.vue'
import type { ToolkitPluginWithNpmInfo } from '@/shared/types/toolkit-plugin.js'
import { onMounted, ref } from 'vue'
import { PluginUtils } from '@/renderer/utils/plugin-utils.js'
import { useLoadingData, type PageData } from 'bilitoolkit-ui'
import { toolkitApi } from '@/renderer/api/toolkit-api'

const defaultPageData: PageData = {
  pageNum: 1,
  pageSize: 20,
  totalPages: 0,
  total: 0,
}
const pageData = ref<PageData>(defaultPageData)
const plugins = ref<ToolkitPluginWithNpmInfo[]>([])
const { loading, loadingData } = useLoadingData()
const showThirdPartyPlugins = ref<boolean>(false)
const blockedPluginIds = ref<string[]>([])

const refreshTableData = loadingData(async () => {
  const { data, ...page } = await PluginUtils.searchNpmPlugins({
    pageNum: pageData.value.pageNum,
    pageSize: pageData.value.pageSize,
    showThirdPartyPlugins: showThirdPartyPlugins.value,
    blockedPluginIds: blockedPluginIds.value,
  })
  plugins.value = data
  pageData.value = page
})

const resetPageData = () => {
  const { pageSize: _, ...rest } = defaultPageData
  Object.assign(pageData.value, rest)
}

const refreshTable = () => {
  plugins.value = []
  resetPageData()
  refreshTableData()
}

onMounted(async () => {
  blockedPluginIds.value = await toolkitApi.core.getBlockedPluginIds()
  await refreshTableData()
})

const handleSizeChange = () => {
  pageData.value.pageNum = 1
  refreshTableData()
}
const handleCurrentChange = () => {
  refreshTableData()
}
</script>

<template>
  <PageContainer v-loading="loading">
    <div class="header">
      <div>目前共有 {{ pageData.total }} 个插件</div>
      <el-switch
        v-model="showThirdPartyPlugins"
        inline-prompt
        active-text="显示第三方插件"
        inactive-text="不显示第三方插件"
        @change="refreshTable"
      />
      <div class="options">
        <el-button @click="refreshTable">刷新</el-button>
      </div>
    </div>
    <plugin-list class="list-container" :plugins="plugins" :type="'market'" />
    <el-pagination
      class="page"
      v-model:current-page="pageData.pageNum"
      v-model:page-size="pageData.pageSize"
      layout="prev, pager, next"
      :total="pageData.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/plugin-market';
</style>
