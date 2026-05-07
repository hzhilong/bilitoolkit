<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/renderer/stores/user.js'
import type { UserInfo } from '@ybgnb/bili-api'
import { biliClient } from '@/renderer/api/bili-client.js'
import { toolkitApi } from '@/renderer/api/toolkit-api.js'
import QRCode from 'qrcode'

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'loginSuccess', user: UserInfo): void
}>()

const qrCodeImg = ref('')
const loginResult = ref('')
let abortController = new AbortController()

const handleCancel = () => {
  abortController.abort('取消登录')
  emit('cancel')
  visible.value = false
}

const startLogin = async () => {
  const context = await biliClient.user.loginWithQRCode(
    {
      async cookieProvider(): Promise<string[]> {
        return await toolkitApi.user.getCurrUserCookie()
      },
      async onQRCodeReceived(qrcodeUrl: string): Promise<void> {
        qrCodeImg.value = await QRCode.toDataURL(qrcodeUrl)
      },
      onStatusChange(msg: string): void {
        loginResult.value = msg
      },
    },
    {
      signal: abortController.signal,
    },
  )
  const userInfo = await biliClient.user.getMyInfo()
  const stat = await biliClient.relation.getStat(userInfo.mid)
  // 官方接口两个都是粉丝数...
  userInfo.follower = stat.follower
  userInfo.following = stat.following
  await useUserStore().loginUser({
    ...userInfo,
    userCookie: context.userCookie,
  })
  emit('loginSuccess', userInfo)
  visible.value = false
}

watch(visible, (newValue) => {
  if (newValue) {
    if (abortController.signal.aborted) {
      abortController = new AbortController()
    }
    startLogin()
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
      <div class="hint">请扫描二维码登录</div>

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
