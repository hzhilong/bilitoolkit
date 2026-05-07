<template>
  <el-form ref="formRef" :model="formData" label-position="right" class="task-config-form" :rules="formRules">
    <el-form-item
      v-for="field in fields"
      :key="field.name"
      :label="field.label"
      :prop="field.name"
      :required="field.required"
    >
      <template #label>
        <span class="form-label">
          {{ field.label }}
          <el-tooltip v-if="field.description" :content="field.description" effect="light" placement="top">
            <el-icon class="description-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </span>
      </template>

      <!-- 单行文本输入 -->
      <el-input
        v-if="field.type === 'input'"
        v-model="formData[field.name]"
        :placeholder="`请输入${field.label}`"
        clearable
      />

      <!-- 多行文本输入 -->
      <el-input
        v-else-if="field.type === 'textarea'"
        v-model="formData[field.name]"
        type="textarea"
        :rows="3"
        :placeholder="`请输入${field.label}`"
        clearable
      />

      <!-- 数字输入 -->
      <el-input-number
        v-else-if="field.type === 'number'"
        v-model="formData[field.name]"
        :controls-position="'right'"
      />

      <!-- 开关 -->
      <el-switch v-else-if="field.type === 'switch'" v-model="formData[field.name]" />

      <!-- 下拉选择（单选） -->
      <el-select
        v-else-if="field.type === 'select'"
        v-model="formData[field.name]"
        :placeholder="`请选择${field.label}`"
        clearable
      >
        <el-option v-for="opt in field.options" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>

      <!-- 多选框组 -->
      <el-checkbox-group v-else-if="field.type === 'checkbox'" v-model="formData[field.name]">
        <el-checkbox v-for="opt in field.options" :key="opt.value" :label="opt.value">
          {{ opt.label }}
        </el-checkbox>
      </el-checkbox-group>

      <!-- 用户 -->
      <UserSelectTrigger v-else-if="field.type === 'user'" v-model="formData[field.name]" :multiple="false" />

      <!-- 多用户 -->
      <UserSelectTrigger v-else-if="field.type === 'users'" v-model="formData[field.name]" :multiple="true" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, watch, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import type { TaskConfigField } from 'bilitoolkit-types'
import UserSelectTrigger from '@/renderer/components/form/UserSelectTrigger.vue'
import { useTaskConfigRules } from '@/renderer/composables/task/useTaskConfigRules.js'

const props = defineProps<{
  fields: TaskConfigField<string>[]
  modelValue: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
}>()

// 表单实例
const formRef = ref<FormInstance>()

// 表单数据
const formData = ref<Record<string, any>>({})
const formRules = useTaskConfigRules(props.fields)

// 同步外部数据到内部，并填充默认值
const syncFormData = () => {
  const newData: Record<string, any> = {}

  // 基于字段配置，优先使用外部传入的值，否则使用默认值
  for (const field of props.fields) {
    const externalValue = props.modelValue?.[field.name]
    if (externalValue !== undefined && externalValue !== null) {
      newData[field.name] = externalValue
    } else if (field.default !== undefined) {
      newData[field.name] = field.default
    } else {
      // 未提供默认值时根据类型设置合理的初始值
      if (field.type === 'users') {
        newData[field.name] = []
      } else if (field.type === 'number') {
        newData[field.name] = undefined
      } else if (field.type === 'switch') {
        newData[field.name] = false
      } else if (field.type === 'checkbox') {
        // 默认值应为数组
        if (Array.isArray(field.default)) {
          newData[field.name] = [...field.default]
        } else if (field.default !== undefined) {
          // 兼容单个值转数组
          newData[field.name] = [field.default]
        } else {
          newData[field.name] = []
        }
      } else {
        newData[field.name] = ''
      }
    }
  }

  // 同时保留外部传入但不在 fields 中的额外字段（防止意外丢失）
  for (const key in props.modelValue) {
    if (!(key in newData)) {
      newData[key] = props.modelValue[key]
    }
  }

  formData.value = newData
}

// 监听外部 modelValue 变化（深度比较避免循环）
let isInternalUpdate = false
watch(
  () => props.modelValue,
  (newVal) => {
    if (isInternalUpdate) return
    const needSync = JSON.stringify(newVal) !== JSON.stringify(formData.value)
    if (needSync) {
      syncFormData()
    }
  },
  { deep: true, immediate: true },
)

// 监听内部 formData 变化，向外抛出（深度比较避免无意义触发）
watch(
  formData,
  (newVal) => {
    const oldVal = props.modelValue
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      isInternalUpdate = true
      emit('update:modelValue', newVal)
      nextTick(() => {
        isInternalUpdate = false
      })
    }
  },
  { deep: true },
)

const getFormData = () => {
  return formData.value
}

const resetFields = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  syncFormData()
}

const validate = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

defineExpose({
  validate,
  getFormData,
  resetFields,
})

// 初始化同步
syncFormData()
</script>

<style scoped lang="scss">
.task-config-form {
  :deep(.el-form-item__content) {
    width: fit-content;
  }

  :deep(.el-select) {
    width: auto !important;

    .el-select__selected-item.el-select__placeholder {
      width: auto;
      display: contents;
    }
  }
}

.form-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.description-icon {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  cursor: help;
  transition: color 0.2s;
}

.description-icon:hover {
  color: var(--el-color-primary);
}
</style>
