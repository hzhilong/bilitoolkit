<script setup lang="ts">
import type { TaskResult } from 'bilitoolkit-types'

withDefaults(defineProps<{ result: TaskResult }>(), {})
const visible = defineModel({ required: true, type: Boolean })
</script>

<template>
  <el-dialog
    v-model="visible"
    width="76%"
    style="max-width: 96%; min-width: 76%; max-height: 90vh; overflow: hidden"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="true"
    align-center
  >
    <div class="result-card">
      <div class="summary-row">
        <span class="status-tag">
          <el-tag v-if="result.success" type="success" disable-transitions>执行成功</el-tag>
          <el-tag v-else type="danger" disable-transitions>执行失败</el-tag>
        </span>
        <span class="result-message">{{ result.message }}</span>
      </div>
      <el-divider />
      <div class="details-container" v-if="result.details" v-html="result.details"></div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.summary-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.details-container {
  padding: 10px;
  box-sizing: border-box;
  border-radius: 10px;
}
</style>
