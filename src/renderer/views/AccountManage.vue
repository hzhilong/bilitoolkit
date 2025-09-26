<script setup lang="ts">
import LoginAccountDialog from '@/renderer/components/dialog/AccountLoginDialog.vue'
import { ref } from 'vue'
import { useBiliAccountStore } from '@/renderer/stores/bili-accounts.ts'
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { BiliAccountCard } from 'bilitoolkit-ui'

const accountDialogVisible = ref(false)
const {accounts} = useBiliAccountStore()
</script>

<template>
  <PageContainer>
    <div class="page-header">
      <el-button type="primary" @click="accountDialogVisible = true">登录新账号</el-button>
    </div>
    <div class="account-list">
      <bili-account-card v-for="account in accounts" :key="account.mid" :account="account" :show-logout-btn="true"></bili-account-card>
    </div>
    <LoginAccountDialog v-model="accountDialogVisible" />
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/account-manage';
</style>
