<template>
  <div class="table-page" v-loading="loading">
    <div class="table-page__header">
      <span class="table-page__header__label"></span>
      <el-button @click="refreshTableData">刷新</el-button>
    </div>
    <div ref="tableWrapperRef" class="table-page__table">
      <el-table height="66vh" :data="tableData" style="width: 100%">
        <el-table-column prop="executionId" label="执行ID" width="100"></el-table-column>
        <el-table-column prop="createdAt" label="日志时间" width="146">
          <template #default="{ row }">
            {{ new Date((row as TaskExecutionLog).createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="日志级别" width="90">
          <template #default="{ row }">
            <el-tag v-if="(row as TaskExecutionLog).level === 'info'" type="info" disable-transitions>info</el-tag>
            <el-tag v-if="(row as TaskExecutionLog).level === 'debug'" type="primary" disable-transitions>debug</el-tag>
            <el-tag v-if="(row as TaskExecutionLog).level === 'error'" type="danger" disable-transitions>error</el-tag>
            <el-tag v-if="(row as TaskExecutionLog).level === 'warn'" type="warning" disable-transitions>warn</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="日志内容" min-width="120"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskExecutionLog } from '@/shared/types/task.js'
import { ref, watch } from 'vue'
import { toolkitApi } from '@/renderer/api/toolkit-api.js'
import { useLoadingData } from 'bilitoolkit-ui'

interface TaskExecutionLogTableProps {
  taskExecutionId: number
}

const props = defineProps<TaskExecutionLogTableProps>()

const tableData = ref<TaskExecutionLog[]>([])
const { loading, loadingData } = useLoadingData()

const refreshTableData = loadingData(async () => {
  tableData.value = await toolkitApi.task.getTaskExecutionLogs(props.taskExecutionId)
})

function refreshTable() {
  tableData.value = []
  refreshTableData()
}

watch(
  () => props.taskExecutionId,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      refreshTable()
    }
  },
  { immediate: true },
)
defineExpose({ refreshTable })
</script>

<style scoped lang="scss">
.table-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 100%;
  flex: 1;
  min-height: 0;
  padding: 10px;
  box-sizing: border-box;

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 10px;

    &__label {
      font-size: 1.1em;
      font-weight: bold;
      margin-right: auto;
    }
  }

  &__page {
    margin-top: 10px;
  }
}
</style>
