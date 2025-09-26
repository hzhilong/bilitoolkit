<script setup lang="ts">
import LoginAccountDialog from '@/renderer/components/dialog/AccountLoginDialog.vue'
import { ref } from 'vue'
import { useBiliAccountStore } from '@/renderer/stores/bili-accounts.ts'
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { BiliAccountCard, AppUtils } from 'bilitoolkit-ui'

const accountDialogVisible = ref(false)
const { accounts, logoutAccount } = useBiliAccountStore()
const mouseAccountId = ref<number | undefined>(undefined)
const logoutBtnVisible = (uid: number) => {
  return mouseAccountId.value != undefined && mouseAccountId.value === uid
}
const logout = async (uid: number) => {
  await AppUtils.confirm('确认退出该账号吗？')
  logoutAccount(uid)
  AppUtils.message('退出成功')
}
</script>

<template>
  <PageContainer>
    <div class="page-header">
      <el-button type="primary" @click="accountDialogVisible = true">登录新账号</el-button>
    </div>
    <div class="account-list">
      <bili-account-card
        class="bili-account-card"
        v-for="account in accounts"
        :key="account.mid"
        :account="account"
        :show-logout-btn="true"
        @mouseenter="mouseAccountId = account.mid"
        @mouseleave="mouseAccountId = undefined"
      >
        <div class="options-close-btn" v-show="logoutBtnVisible(account.mid)" @click="logout(account.mid)"></div>
      </bili-account-card>
    </div>
    <LoginAccountDialog v-model="accountDialogVisible" />
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/account-manage';
</style>
