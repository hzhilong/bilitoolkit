<template>
  <PageContainer v-if="plugin">
    <div class="plugin-info">
      <div class="plugin-info__row">
        <img class="plugin-info__icon" :src="pluginIcon" alt="" />
        <span class="plugin-info__name">{{ plugin.name }}</span>
      </div>
      <div class="plugin-info__row">
        <span class="plugin-info__id">{{ plugin.id }}</span>
        <span class="plugin-info__version">{{ plugin.version }}</span>
      </div>
      <div class="plugin-info__row">
        <span class="plugin-info__desc">{{ plugin.description }}</span>
      </div>
    </div>
    <el-divider />
    <TaskTable :plugin-id="pluginId" />
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import type { TaskPluginInfo } from '@/shared/types/task.js'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toolkitApi } from '@/renderer/api/toolkit-api.js'
import { getPluginIconCache } from '@/renderer/services/plugin-icon-service.js'
import TaskTable from '@/renderer/views/task/TaskTable.vue'

const route = useRoute()
const plugin = ref<TaskPluginInfo>({} as TaskPluginInfo)
const pluginId = route.query.id as string
const pluginIcon = ref()

onMounted(async () => {
  plugin.value = await toolkitApi.task.getTaskPluginInfo(pluginId)
  pluginIcon.value = await getPluginIconCache(plugin.value)
})
</script>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/task-plugin';
</style>
