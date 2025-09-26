<script setup lang="ts">
import LoginAccountDialog from '@/renderer/components/dialog/AccountLoginDialog.vue'
import { cloneDeep } from 'lodash'
import { reactive, ref } from 'vue'
import type { AccountSelectDialogProps } from '@/renderer/components/dialog/types.ts'
import { BiliAccountCard } from 'bilitoolkit-ui'
import { useBiliAccountStore } from '@/renderer/stores/bili-accounts.ts'
import type { BiliAccountInfo } from 'bilitoolkit-api-types'

const visible = defineModel<boolean>({ required: true })
const props = withDefaults(defineProps<AccountSelectDialogProps>(), {})
const options: AccountSelectDialogProps = reactive(cloneDeep(props))

// 显示
const show = (newOptions?: AccountSelectDialogProps) => {
  Object.assign(options, newOptions)
  visible.value = true
}
// 隐藏
const hide = () => {
  visible.value = false
}

const accountDialogVisible = ref(false)
const accountStore = useBiliAccountStore()
const accounts = accountStore.accounts

const handleCancel = () => {
  visible.value = false
  options.onCancel?.()
}

const handleSelect = (account: BiliAccountInfo) => {
  visible.value = false
  options.onSelected(account)
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
      <div class="header">
        <el-button type="primary" @click="accountDialogVisible = true">登录新账号</el-button>
      </div>
      <div class="account-list">
        <BiliAccountCard
          class="account-card"
          v-for="account in accounts"
          :key="account.mid"
          :account="account"
          @click="handleSelect(account)"
        ></BiliAccountCard>
      </div>
    </div>
    <template #footer></template>
    <LoginAccountDialog v-model="accountDialogVisible" />
  </el-dialog>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: end;
}

.account-list {
  max-height: 300px;
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px 10px;
  box-sizing: border-box;

  .account-card {
    width: 100%;
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
