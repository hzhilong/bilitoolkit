<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import TaskConfigForm from '@/renderer/components/form/TaskConfigForm.vue'
import { cloneDeep } from 'lodash-es'
import { type TaskModalProps, type TaskSubmitPayload, defaultSchedule } from '@/renderer/views/task/TaskModal.types.js'
import type { FormInstance } from 'element-plus'
import type { Task } from '@/shared/types/task.js'
import { useRunConfigRules } from '@/renderer/composables/task/useRunConfigRules.js'

const props = withDefaults(defineProps<TaskModalProps>(), {})
const visible = defineModel({ required: true, type: Boolean })

const emit = defineEmits<{
  (e: 'submit', task: TaskSubmitPayload): void
  (e: 'cancel'): void
}>()

const title = ref<string>()
const pluginConfigFormRef = ref<InstanceType<typeof TaskConfigForm>>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const taskPluginConfig = ref<Record<string, any>>({})

const runConfigFormRef = ref<FormInstance>()
const runConfig = reactive<Required<Pick<Task, 'schedule' | 'enabled'>>>({
  schedule: defaultSchedule,
  enabled: true,
})
const runConfigRules = useRunConfigRules(runConfig)
watch(
  () => runConfig.schedule?.type,
  () => {},
)

watch(
  () => [props.type, props.task, props.title],
  () => {
    if (props.type === 'update' && props.task) {
      title.value = props.title ?? '更新任务'
      taskPluginConfig.value = cloneDeep(props.task.config ?? {})
      runConfig.schedule = cloneDeep(props.task.schedule ?? defaultSchedule)
      runConfig.enabled = props.task.enabled
    } else if (props.type === 'add') {
      title.value = props.title ?? '创建'
      taskPluginConfig.value = {}
      runConfig.schedule = cloneDeep(props.plugin.taskSchedule ?? defaultSchedule)
      runConfig.enabled = true
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = async () => {
  if (!pluginConfigFormRef.value || !runConfigFormRef.value) return
  if (!(await pluginConfigFormRef.value.validate()) || !(await runConfigFormRef.value.validate())) return
  if (props.type === 'add') {
    emit('submit', {
      type: 'add',
      data: {
        pluginId: props.plugin.id,
        config: taskPluginConfig.value,
        ...runConfig,
      },
    })
  } else {
    emit('submit', {
      type: 'update',
      data: {
        ...props.task,
        config: taskPluginConfig.value,
        ...runConfig,
      },
    })
  }
  visible.value = false
}

const handleReset = () => {
  pluginConfigFormRef.value?.resetFields()
  runConfigFormRef.value?.resetFields()
}

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="fit-content"
    style="max-width: 82%; min-width: 50%"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :show-close="true"
    align-center
  >
    <div class="task">
      <div class="task__plugin-config" v-if="plugin.taskConfigSchema">
        <div class="task__plugin-config__label">插件配置：</div>
        <TaskConfigForm
          ref="pluginConfigFormRef"
          class="task__plugin-config__form"
          :fields="plugin.taskConfigSchema.fields"
          v-model="taskPluginConfig"
        ></TaskConfigForm>
      </div>
      <div class="task__run-config">
        <div class="task__run-config__label">运行配置：</div>
        <el-form
          ref="runConfigFormRef"
          :model="runConfig"
          :rules="runConfigRules"
          class="task__run-config__form"
          label-position="right"
        >
          <el-form-item prop="schedule.type" label="调度类型">
            <el-radio-group class="flex-center-nowrap" v-model="runConfig.schedule.type">
              <el-radio value="cron">cron 表达式</el-radio>
              <el-radio value="interval">固定间隔</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            prop="schedule.value"
            :label="runConfig.schedule.type === 'cron' ? 'cron 表达式' : '间隔时间(秒)'"
          >
            <el-input
              v-model="runConfig.schedule.value"
              :validate-event="false"
              :placeholder="`请输入${runConfig.schedule.type === 'cron' ? 'cron 表达式' : '间隔时间(秒)'}`"
              clearable
            />
          </el-form-item>
          <el-form-item label="是否启用">
            <el-switch class="task__run-config__item__value" v-model="runConfig.enabled" />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.task {
  display: flex;
  flex-direction: column;

  &__plugin-config,
  &__run-config {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 1em;

    &__label {
      font-weight: bold;
      font-size: 1rem;
      margin-bottom: 10px;
    }

    &__form {
      padding: 4px 20px;
      border-radius: 8px;
      border: 1px solid var(--el-border-color-extra-light);

      ::v-deep(.el-form-item) {
        width: fit-content;
      }
    }
  }
}
</style>
