<script setup lang="ts">
import { watch } from 'vue'
import type { BiliAccount } from 'bilitoolkit-api-types'
import { useLoginQRCode } from '@/renderer/composables/user/useLoginQRCode.ts'
import { useBiliAccountStore } from '@/renderer/stores/bili-accounts.ts'

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'loginSuccess', account: BiliAccount): void
}>()

const { qrCodeImg, loginResult, onLoginSuccess, refreshQRCode, cancelLogin } = useLoginQRCode()

const handleCancel = () => {
  visible.value = false
  cancelLogin()
  emit('cancel')
}
onLoginSuccess((account: BiliAccount) => {
  useBiliAccountStore().loginAccount(account)
  visible.value = false
  emit('loginSuccess', account)
})
watch(visible, (newValue) => {
  if (newValue) {
    refreshQRCode()
  }
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="登录账号"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="true"
    @close="handleCancel"
  >
    <div class="content-container">
      <div class="hint">
        请扫描二维码登录
        <el-button @click="refreshQRCode">刷新</el-button>
      </div>

      <div class="qrcode-container">
        <div>获取二维码中，请稍候...</div>
        <img alt="" :src="qrCodeImg" />
      </div>
      <div class="login-result">{{ loginResult }}</div>
    </div>
    <template #footer></template>
  </el-dialog>
</template>

<style scoped lang="scss">
.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--el-text-color-regular);
  gap: 20px;
  user-select: none;

  .qrcode-container {
    width: 200px;
    height: 200px;
    color: var(--el-text-color-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    > img {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
    }
  }
}
</style>
