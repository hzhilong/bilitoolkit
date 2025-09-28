<script setup lang="ts">
import { cloneDeep } from 'lodash'
import { reactive } from 'vue'
import type { AccountAuthDialogProps } from '@/renderer/components/dialog/types.ts'
import { BiliAccountCard } from 'bilitoolkit-ui'
import PluginCard from '@/renderer/components/plugin/PluginCard.vue'

const visible = defineModel<boolean>({ required: true })
const props = withDefaults(defineProps<AccountAuthDialogProps>(), {})
const options: AccountAuthDialogProps = reactive(cloneDeep(props))

// 显示
const show = (newOptions?: Partial<AccountAuthDialogProps>) => {
  Object.assign(options, newOptions)
  visible.value = true
}
// 隐藏
const hide = () => {
  visible.value = false
}

const handleCancel = () => {
  visible.value = false
  options.onCancel?.()
}

const handleConfirm = () => {
  visible.value = false
  options.onConfirm()
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
    @close="handleCancel"
  >
    <div class="content-container">
      <div class="header"></div>
      <bili-account-card class="account-card" :account="account" />
      <div class="arrow">⬇</div>
      <plugin-card class="plugin-card" :plugin="plugin" type="no-options" />
      <div class="detail">
        <div>此插件请求获得账号cookies</div>
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

.account-card {
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
  margin: 10px 0;
  padding: 10px;
  text-align: center;
  border: 2px solid var(--el-border-color);
  border-radius: 12px;
}
</style>
