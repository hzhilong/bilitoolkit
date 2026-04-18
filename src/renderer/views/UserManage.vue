<script setup lang="ts">
import UserLoginDialog from '@/renderer/components/dialog/UserLoginDialog.vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/renderer/stores/user.ts'
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { showConfirm, showToast, BiliUserCard } from 'bilitoolkit-ui'
import { toolkitApi } from '@/renderer/api/toolkit-api.ts'

const userDialogVisible = ref(false)
const userStore = useUserStore()
const users = userStore.users
const logoutUser = userStore.logoutUser

const mouseuserId = ref<number | undefined>(undefined)
const logoutBtnVisible = (uid: number) => {
  return mouseuserId.value != undefined && mouseuserId.value === uid
}
const logout = async (uid: number) => {
  await showConfirm('确认退出该账号吗？')
  await logoutUser(uid)
  showToast('退出成功')
}
const test = async () => {
  console.log(`test`, await toolkitApi.user.switchUser())
}

onMounted(() => {
  toolkitApi.event.onUserLogout((user) => {
    console.log(`监听到用户退出`, user)
  })
})
</script>

<template>
  <PageContainer>
    <div class="page-header">
      <el-button type="primary" @click="userDialogVisible = true">登录新账号</el-button>
      <el-button type="primary" @click="test">test</el-button>
    </div>
    <div class="user-list">
      <bili-user-card
        class="bili-user-card"
        v-for="user in users"
        :key="user.mid"
        :user="user"
        :show-logout-btn="true"
        @mouseenter="mouseuserId = user.mid"
        @mouseleave="mouseuserId = undefined"
      >
        <div class="options-close-btn" v-show="logoutBtnVisible(user.mid)" @click="logout(user.mid)"></div>
      </bili-user-card>
    </div>
    <UserLoginDialog v-model="userDialogVisible" />
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/user-manage';
</style>
