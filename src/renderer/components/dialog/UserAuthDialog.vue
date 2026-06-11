<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { reactive } from 'vue'
import PluginCard from '@/renderer/components/plugin/PluginCard.vue'
import type { UserAuthDialogProps } from '@/renderer/components/dialog/types.js'
import { BiliUserCard } from 'bilitoolkit-ui'

const visible = defineModel<boolean>({ required: true })
const props = withDefaults(defineProps<UserAuthDialogProps>(), {})
const options: UserAuthDialogProps = reactive(cloneDeep(props))

// 显示
const show = (newOptions?: Partial<UserAuthDialogProps>) => {
  Object.assign(options, newOptions)
  visible.value = true
}
// 隐藏
const hide = () => {
  visible.value = false
}

const handleCancel = () => {
  options.onCancel?.()
  visible.value = false
}

const handleConfirm = () => {
  options.onConfirm()
  visible.value = false
}

defineExpose({ show, hide })
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="options.title"
    width="380px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="true"
    align-center
    @close="handleCancel"
  >
    <div class="content-container">
      <div class="header"></div>
      <bili-user-card class="user-card" :user="user" />
      <div class="arrow">⬇</div>
      <plugin-card class="plugin-card" :plugin="plugin" type="no-options" />
      <div class="detail">
        <div>此插件请求获得账号cookie</div>
        <div>授权后插件可完全操控你的账号</div>
        <div>请在信任该插件作者的情况下确认操作</div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: end;
}

.user-card {
  width: 100%;
}
.arrow {
  font-size: 20px;
  color: var(--el-color-primary);
  text-align: center;
}
.plugin-card {
  width: 100%;
}

.detail {
  color: var(--el-text-color-secondary);
  padding: 10px;
  margin: 22px 0 10px;
  text-align: center;
  border: 2px dashed var(--el-border-color);
  border-radius: 12px;
}
</style>
