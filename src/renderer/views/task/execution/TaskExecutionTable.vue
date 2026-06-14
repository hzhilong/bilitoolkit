<template>
  <div class="table-page" v-loading="loading">
    <div class="table-page__header">
      <span class="table-page__header__label"></span>
      <el-button @click="refreshTable">刷新</el-button>
    </div>
    <div ref="tableWrapperRef" class="table-page__table">
      <el-table height="66vh" :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" min-width="50" width="50" />
        <el-table-column prop="status" label="状态" min-width="80" width="80">
          <template #default="{ row }">
            <el-tag v-if="(row as TaskExecution).status === 'running'" type="primary" disable-transitions
              >执行中</el-tag
            >
            <el-tag v-if="(row as TaskExecution).status === 'success'" type="success" disable-transitions
              >执行成功</el-tag
            >
            <el-tag v-if="(row as TaskExecution).status === 'error'" type="danger" disable-transitions>执行失败</el-tag>
            <el-tag v-if="(row as TaskExecution).status === 'canceled'" type="warning" disable-transitions
              >取消执行</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="startedAt" label="启动时间" min-width="86">
          <template #default="{ row }">
            {{ formatTime((row as TaskExecution).startedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="endedAt" label="结束时间" min-width="86">
          <template #default="{ row }">
            {{ formatTime((row as TaskExecution).endedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="result" label="执行结果" min-width="100">
          <template #default="{ row }">
            <template v-if="(row as TaskExecution).result">
              <AppTooltip :content="((row as TaskExecution).result as TaskResult).message">
                {{ row.result?.message }}
              </AppTooltip>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100">
          <template #default="{ row }">
            <div class="table-row-options">
              <el-button
                v-if="(row as TaskExecution).result"
                link
                type="primary"
                size="small"
                @click="handleShowResult((row as TaskExecution).result as TaskResult)"
                >结果</el-button
              >
              <el-button link type="primary" size="small" @click="handleShowLog(row as TaskExecution)">日志</el-button>
              <el-popconfirm
                v-if="(row as TaskExecution).status === 'running'"
                title="确认取消执行吗？"
                @confirm="handleAbort(row as TaskExecution)"
              >
                <template #reference>
                  <el-button link type="primary" size="small">取消</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      class="table-page__page"
      v-model:current-page="pageData.pageNum"
      v-model:page-size="pageData.pageSize"
      :page-sizes="[20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageData.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <TaskExecutionLogsModal
      v-if="currRowExecutionId"
      :task-execution-id="currRowExecutionId"
      v-model="logModalVisible"
    />
    <ExecutionResultModal v-if="currExecutionResult" :result="currExecutionResult" v-model="resultModalVisible" />
  </div>
</template>

<script setup lang="ts">
import type { TaskExecution } from '@/shared/types/task.js'
import { ref, watch } from 'vue'
import { toolkitApi } from '@/renderer/api/toolkit-api.js'
import { AppTooltip, useLoadingData, type PageData } from 'bilitoolkit-ui'
import TaskExecutionLogsModal from '@/renderer/views/task/execution-log/TaskExecutionLogsModal.vue'
import ExecutionResultModal from '@/renderer/views/task/execution/ExecutionResultModal.vue'
import type { TaskResult } from 'bilitoolkit-types'
import { formatTime } from '@ybgnb/utils'

interface TaskExecutionTableProps {
  taskId: number
}

const props = defineProps<TaskExecutionTableProps>()

const defaultPageData: PageData = {
  pageNum: 1,
  pageSize: 20,
  totalPages: 0,
  total: 0,
}
const pageData = ref<PageData>(defaultPageData)
const tableData = ref<TaskExecution[]>([])
const { loading, loadingData } = useLoadingData()

const refreshTableData = loadingData(async () => {
  const { data, ...page } = await toolkitApi.task.getTaskExecutionsByPage(
    {
      pageNum: pageData.value.pageNum,
      pageSize: pageData.value.pageSize,
    },
    {
      taskId: props.taskId,
    },
  )
  tableData.value = data
  pageData.value = page
})

const resetPageData = () => {
  const { pageSize: _, ...rest } = defaultPageData
  Object.assign(pageData.value, rest)
}
const refreshTable = () => {
  tableData.value = []
  resetPageData()
  refreshTableData()
}
watch(
  () => props.taskId,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      refreshTable()
    }
  },
  { immediate: true },
)

const handleSizeChange = () => {
  pageData.value.pageNum = 1
  refreshTableData()
}
const handleCurrentChange = () => {
  refreshTableData()
}

const currRowExecutionId = ref<number>()
const logModalVisible = ref(false)
const handleAbort = async (taskExecution: TaskExecution) => {
  await toolkitApi.task.abortTaskExecution(taskExecution)
  await refreshTableData()
}
const handleShowLog = (taskExecution: TaskExecution) => {
  currRowExecutionId.value = taskExecution.id
  logModalVisible.value = true
}
const currExecutionResult = ref<TaskResult>()
const resultModalVisible = ref(false)
const handleShowResult = (result: TaskResult) => {
  currExecutionResult.value = result
  resultModalVisible.value = true
}

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
    margin-left: auto;
  }
}
</style>
