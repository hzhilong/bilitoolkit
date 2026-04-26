<script setup lang="ts">
import TaskExecutionLogTable from '@/renderer/views/task/execution-log/TaskExecutionLogTable.vue'
import { useTemplateRef, watch } from 'vue'

withDefaults(defineProps<{ taskExecutionId: number }>(), {})
const visible = defineModel({ required: true, type: Boolean })
const tableRef = useTemplateRef<InstanceType<typeof TaskExecutionLogTable>>('tableRef')

watch(visible, (newVal) => {
  if (newVal) {
    tableRef.value?.refreshTable()
  }
})
</script>

<template>
  <el-dialog
    title="任务执行日志"
    v-model="visible"
    width="96%"
    style="max-width: 96%; min-width: 80%; max-height: 90vh; overflow: hidden"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="true"
    align-center
  >
    <TaskExecutionLogTable ref="tableRef" :task-execution-id="taskExecutionId"></TaskExecutionLogTable>
  </el-dialog>
</template>

<style scoped lang="scss">
.execution-table-dialog {
  display: flex;
  flex-direction: column;

  ::v-deep(.el-dialog__body) {
    flex: 1;
  }
}
</style>
