<script setup lang="ts">
import type { TaskResult } from 'bilitoolkit-types'
import { ref } from 'vue'
import { toolkitApi } from '@/renderer/api/toolkit-api'

const props = withDefaults(defineProps<{ result: TaskResult; pluginId: string }>(), {})
const visible = defineModel({ required: true, type: Boolean })

const showImagePreview = ref<boolean>(false)
const imgSrcList = ref<string[]>([])
const imgInitialIndex = ref<number>(0)

const handleOpenFile = async (actionId: string) => {
  for (const action of props.result.actions ?? []) {
    if (action.type === 'open-plugin-file' && action.actionId === actionId) {
      await toolkitApi.core.showItemInPluginFolder(props.pluginId, action.filePath)
      return
    }
  }
}

const handleLink = async (actionId: string) => {
  for (const action of props.result.actions ?? []) {
    if (action.type === 'link' && action.actionId === actionId) {
      window.open(action.url)
      return
    }
  }
}

const handleImagePreview = async (el: HTMLElement, actionId: string) => {
  for (const action of props.result.actions ?? []) {
    if (action.type === 'image-preview' && action.actionId === actionId) {
      const index = Number(el.getAttribute('data-index') ?? 0)
      if (action.srcList?.length > 0) {
        imgSrcList.value = action.srcList
        imgInitialIndex.value = Math.min(action.srcList.length - 1, index)
        console.log(imgInitialIndex.value)
        showImagePreview.value = true
        return
      }
    }
  }
}
const handleHtmlClick = async (e: MouseEvent) => {
  const target = (e.target as HTMLElement).closest('[data-action-id][data-action-type]')

  if (!target) return

  const type = target.getAttribute('data-action-type')
  const actionId = target.getAttribute('data-action-id')!
  if (type === 'image-preview') {
    e.stopPropagation()
    await handleImagePreview(e.target as HTMLElement, actionId)
  } else if (type === 'link') {
    e.stopPropagation()
    await handleLink(actionId)
  } else if (type === 'open-plugin-file') {
    e.stopPropagation()
    await handleOpenFile(actionId)
  }
}
</script>

<template>
  <div class="execution-result-modal">
    <el-dialog
      v-model="visible"
      width="76%"
      style="max-width: 96%; min-width: 76%; max-height: 80vh; overflow: hidden"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      :show-close="true"
      align-center
    >
      <template #footer> </template>
      <div class="result-card">
        <div class="summary-row">
          <span class="status-tag">
            <el-tag v-if="result.success" type="success" disable-transitions>执行成功</el-tag>
            <el-tag v-else type="danger" disable-transitions>执行失败</el-tag>
          </span>
          <span class="result-message">{{ result.message }}</span>
        </div>
        <div class="details-container" v-if="result.details" v-html="result.details" @click="handleHtmlClick"></div>
      </div>
      <el-image-viewer
        v-if="showImagePreview"
        :url-list="imgSrcList"
        show-progress
        :initial-index="imgInitialIndex"
        @close="showImagePreview = false"
      />
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.execution-result-modal {
  display: contents;

  ::v-deep(.el-dialog) {
    display: flex;
    flex-direction: column;

    .el-dialog__body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .el-dialog__footer {
      display: none;
    }
  }
  .summary-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
  .result-card {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
  }
  .details-container {
    padding: 10px;
    box-sizing: border-box;
    border-radius: 10px;
    min-height: 0;
    flex: 1;
    overflow-y: auto;
  }
}
</style>
