<script setup lang="ts">
import UserLoginDialog from '@/renderer/components/dialog/UserLoginDialog.vue'
import { ref } from 'vue'
import { useUserStore } from '@/renderer/stores/user.ts'
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { showConfirm, showToast } from 'bilitoolkit-ui'
import { BiliUserCard } from 'bilitoolkit-ui'

const userDialogVisible = ref(false)
const { users, logoutUser } = useUserStore()
const mouseuserId = ref<number | undefined>(undefined)
const logoutBtnVisible = (uid: number) => {
  return mouseuserId.value != undefined && mouseuserId.value === uid
}
const logout = async (uid: number) => {
  await showConfirm('确认退出该账号吗？')
  logoutUser(uid)
  showToast('退出成功')
}
</script>

<template>
  <PageContainer>
    <div class="page-header">
      <el-button type="primary" @click="userDialogVisible = true">登录新账号</el-button>
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
