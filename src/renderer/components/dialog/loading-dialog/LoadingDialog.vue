<!--加载框-->
<script setup lang="ts">
import { cloneDeep } from 'lodash'
import { reactive, ref, watch } from 'vue'
import type {
  LoadingDialogExposed,
  LoadingDialogProps,
} from '@/renderer/components/dialog/loading-dialog/loading-dialog'

const visible = defineModel<boolean>({ required: true })
const props = withDefaults(defineProps<LoadingDialogProps>(), {
  canCancel: true,
})

const options: LoadingDialogProps = reactive(cloneDeep(props))
const loading = ref(visible)
const resetLoadingText = () => {
  options.loadingText = options.loadingText ?? '加载中...'
}

const handleCancel = () => {
  visible.value = false
  options.onCancel?.()
}

watch(visible, (newValue) => {
  loading.value = newValue
})
// 显示
const show = (newOptions?: LoadingDialogProps) => {
  Object.assign(options, newOptions)
  resetLoadingText()
  loading.value = true
  visible.value = true
}
// 隐藏
const hide = () => {
  loading.value = false
  visible.value = false
}
defineExpose<LoadingDialogExposed>({ show, hide })
</script>

<template>
  <div class="loading-mask el-overlay" v-show="visible">
    <div class="loading-content">
      <div class="options-close-btn" v-show="options.canCancel" @click="handleCancel"></div>
      <div class="loading-spinner" v-loading="loading"></div>
      <div class="loading-text">{{ options.loadingText }}</div>
    </div>
  </div>
</template>

<style lang="scss">
.loading-mask .el-loading-mask {
  background-color: unset !important;
}
</style>

<style scoped lang="scss">
@use '@/renderer/assets/scss/global' as *;

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--el-overlay-color-lighter);
  z-index: 9999;
  user-select: none;

  .loading-content {
    min-width: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background: var(--app-color-background);
    padding: 20px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;

    .options-close-btn {
    }

    .loading-spinner {
      width: var(--el-loading-spinner-size);
      height: var(--el-loading-spinner-size);
    }

    .loading-text {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}
</style>
