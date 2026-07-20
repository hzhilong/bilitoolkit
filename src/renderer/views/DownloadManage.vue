<template>
  <PageContainer>
    <DownloadManagePage>
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
import { DownloadManagePage } from 'bilitoolkit-ui'
import type { DownloadRecord } from '@/shared/types/download'
</script>

<style scoped lang="scss"></style>
