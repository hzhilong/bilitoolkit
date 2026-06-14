<template>
  <div class="tasks" v-loading="loading">
    <div class="tasks__header">
      <span class="tasks__header__label">任务列表：</span>
      <el-button @click="refreshTableData">刷新</el-button>
      <el-button v-if="pluginId" @click="openModal('add')">新建</el-button>
    </div>
    <el-table class="tasks__table" :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" min-width="60" width="60" />
      <el-table-column v-if="!pluginId" prop="pluginId" label="插件信息" min-width="180">
        <template #default="{ row }">
          <AppTooltip :content="(row as TaskWithPlugin).pluginId">
            {{ (row as TaskWithPlugin).pluginId }}
          </AppTooltip>
          <div>
            <el-link
              v-if="(row as TaskWithPlugin).plugin"
              type="primary"
              @click="PluginUtils.openPluginView((row as TaskWithPlugin).plugin!)"
              >{{ (row as TaskWithPlugin).plugin?.name }}</el-link
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="86">
        <template #default="{ row }">
          {{ new Date((row as TaskWithPlugin).createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="调度规则" min-width="80">
        <template #default="{ row }">
          <div v-if="(row as TaskWithPlugin).schedule">
            <span v-if="(row as TaskWithPlugin).schedule!.type === 'cron'">
              {{ (row as TaskWithPlugin).schedule!.value }}
            </span>
            <span v-else-if="(row as TaskWithPlugin).schedule!.type === 'interval'">
              {{ (row as TaskWithPlugin).schedule!.value }} s</span
            >
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="enabled" label="状态" min-width="66">
        <template #default="{ row }">
          <el-tag :type="(row as TaskWithPlugin).enabled ? 'success' : 'danger'" disable-transitions>
            {{ (row as TaskWithPlugin).enabled ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastRunAt" label="最后运行" min-width="86">
        <template #default="{ row }">
          {{ (row as TaskWithPlugin).lastRunAt ? new Date((row as TaskWithPlugin).lastRunAt!).toLocaleString() : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="160">
        <template #default="{ row }">
          <div class="table-row-options">
            <el-button link type="primary" size="small" @click="openModal('update', row as TaskWithPlugin)"
              >编辑</el-button
            >
            <el-popconfirm title="确认删除吗？" @confirm="handleDelete((row as TaskWithPlugin).id)">
              <template #reference>
                <el-button link type="primary" size="small">删除</el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm title="确认手动执行吗？" @confirm="handleExecute(row as TaskWithPlugin)">
              <template #reference>
                <el-button link type="primary" size="small">执行</el-button>
              </template>
            </el-popconfirm>
            <el-button link type="primary" size="small" @click="openModal('execution', row as TaskWithPlugin)"
              >执行记录</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
    <template v-if="currRowPlugin">
      <TaskModal
        type="add"
        :plugin="currRowPlugin"
        v-model="addModalVisible"
        :title="`添加[${currRowPlugin.name}]任务`"
        @submit="handleModalSubmit"
      />
      <TaskModal
        type="update"
        :plugin="currRowPlugin"
        :task="currRowTask"
        v-model="updateModalVisible"
        :title="`修改[${currRowPlugin.name}]任务`"
        @submit="handleModalSubmit"
      />
    </template>
    <TaskExecutionsModal
      v-if="currRowTask"
      :task-id="currRowTask.id"
      v-model="executionModalVisible"
    ></TaskExecutionsModal>
  </div>
</template>

<script setup lang="ts">
import type { TaskPluginInfo, TaskWithPlugin, Task } from '@/shared/types/task.js'
import { ref, watch } from 'vue'
import { toolkitApi } from '@/renderer/api/toolkit-api.js'
import { AppTooltip, useAutoRefreshData, showToast, showError } from 'bilitoolkit-ui'
import TaskModal from '@/renderer/views/task/TaskModal.vue'
import type { TaskSubmitPayload } from '@/renderer/views/task/TaskModal.types.js'
import { PluginUtils } from '@/renderer/utils/plugin-utils.js'
import TaskExecutionsModal from '@/renderer/views/task/execution/TaskExecutionsModal.vue'
import { appEnv } from '@ybgnb/vite-env/common'

interface TaskTableProps {
  pluginId?: string
}

const props = defineProps<TaskTableProps>()
const tableData = ref<TaskWithPlugin[]>([])
const plugin = ref<TaskPluginInfo>()
const currRowPlugin = ref<TaskPluginInfo>()
const currRowTask = ref<Task>()

const { refreshTableData, loading, reset } = useAutoRefreshData(
  async () => {
    if (props.pluginId) {
      tableData.value = await toolkitApi.task.getTaskList(props.pluginId)
    } else {
      tableData.value = await toolkitApi.task.getTaskListWithPlugin()
    }
  },
  appEnv.DEV ? 999999 : 3000,
)
const refreshTable = () => {
  tableData.value = []
  reset()
  refreshTableData()
}

watch(
  () => props.pluginId,
  async () => {
    if (props.pluginId) {
      plugin.value = await toolkitApi.task.getTaskPluginInfo(props.pluginId)
    }
    refreshTable()
  },
  { immediate: true },
)

const addModalVisible = ref(false)
const updateModalVisible = ref(false)
const executionModalVisible = ref(false)

const openModal = (type: 'add' | 'update' | 'execution', currTask?: TaskWithPlugin) => {
  currRowTask.value = currTask
  currRowPlugin.value = props.pluginId ? plugin.value : currTask?.plugin
  if (type === 'add') {
    addModalVisible.value = true
  } else if (type === 'update') {
    updateModalVisible.value = true
  } else if (type === 'execution') {
    executionModalVisible.value = true
  }
}

const handleModalSubmit = async (payload: TaskSubmitPayload) => {
  if (payload.type === 'add') {
    await toolkitApi.task.createTask(payload.data)
  } else if (payload.type === 'update') {
    await toolkitApi.task.updateTask(payload.data)
  }
  await refreshTableData()
}
const handleDelete = async (id: number) => {
  await toolkitApi.task.deleteTask(id)
  refreshTableData()
}

const handleExecute = async (task: TaskWithPlugin) => {
  const result = await toolkitApi.task.executeTask(task)
  if (!result.accepted) {
    showError(result.reason ?? '任务被拒绝执行')
  } else {
    showToast('任务成功启动，正在执行')
  }
}
</script>

<style scoped lang="scss">
.tasks {
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
}
</style>
