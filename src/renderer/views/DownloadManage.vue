<template>
  <PageContainer>
    <DownloadManagePage ref="refDownloadManagePage">
      <template #itemTitleExtra="{ task }: { task: DownloadTask }">
        <DownloadPluginInfo v-if="task" :task="task" />
      </template>
      <template #detailsDialog="{ task }: { task: DownloadTask }">
        <el-descriptions-item label="归属插件" v-if="task && (task as DownloadRecord).pluginId !== 'core'">
          <DownloadPluginInfo :task="task" :hiddenBorder="true" :canOpen="false" />
        </el-descriptions-item>
      </template>
    </DownloadManagePage>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import DownloadPluginInfo from '@/renderer/components/download/DownloadPluginInfo.vue'
import type { DownloadTask } from 'bilitoolkit-types'
import { DownloadManagePage, toolkitApi } from 'bilitoolkit-ui'
import type { DownloadRecord, DownloadTaskChangePayload } from '@/shared/types/download'
import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import { HOST_EVENT_CHANNELS } from '@/shared/types/host-event-channel'

const refDownloadManagePage = useTemplateRef<InstanceType<typeof DownloadManagePage>>('refDownloadManagePage')

let cancelListener: (() => void) | null = null

onMounted(async () => {
  cancelListener = await toolkitApi.event.on(HOST_EVENT_CHANNELS.DOWNLOAD_TASK_CHANGE, (...data: unknown[]) => {
    console.log(`data`, data)
    const payload = data[0] as DownloadTaskChangePayload
    if (payload.type !== 'update') {
      refDownloadManagePage.value?.refresh()
    }
  })
})

onUnmounted(() => {
  cancelListener?.()
})
</script>

<style scoped lang="scss"></style>
