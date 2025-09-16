<script setup lang="ts">
import { watch } from 'vue'
import type { CountdownDialogProps } from '@/renderer/components/dialog/countdown/types.ts'
import { useCountdown } from '@/renderer/components/dialog/countdown/useCountdown.ts'

const props = withDefaults(defineProps<CountdownDialogProps>(), {
  title: '提示',
  confirmBtnText: '确定',
  cancelBtnText: '取消',
  width: 500,
})

const visible = defineModel<boolean>({ required: true })
const emit = defineEmits(['onConfirm', 'onCancel'])
const { countdown, start: startCountdown, stop: stopCountdown } = useCountdown(props.countdown)
// 是否准备关闭
let isPrepareClose = false

const closeDialog = (type: 'confirm' | 'cancel') => {
  // 防止倒计时快结束的时候点击按钮重复触发
  if (isPrepareClose) return
  // 标记对话框准备关闭
  isPrepareClose = true
  stopCountdown()
  visible.value = false
  emit(type === 'confirm' ? 'onConfirm' : 'onCancel', type)
  isPrepareClose = false
}

const handleConfirm = () => closeDialog('confirm')
const handleCancel = () => closeDialog('cancel')

// 主动开始倒计时
const show = () => {
  // 重置倒计时状态
  visible.value = true
  startCountdown(handleCancel)
}
// 弹窗展示时自动开始倒计时
watch(visible, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    startCountdown(handleCancel)
  }
})

defineExpose({ show })
</script>

<template>
  <!-- 只留一个右上角的关闭按钮 -->
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
  >
    <div>{{ content }}</div>
    <div>{{ countdown }}秒后自动取消</div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">{{ cancelBtnText }}({{ countdown }}s)</el-button>
        <el-button type="primary" :disabled="countdown <= 0" @click="handleConfirm">{{ confirmBtnText }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
