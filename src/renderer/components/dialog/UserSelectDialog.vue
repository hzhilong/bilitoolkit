<script setup lang="ts">
import UserLoginDialog from '@/renderer/components/dialog/UserLoginDialog.vue'
import { cloneDeep } from 'lodash-es'
import { reactive, ref } from 'vue'
import type { UserSelectDialogProps } from '@/renderer/components/dialog/types.ts'
import { useUserStore } from '@/renderer/stores/user.ts'
import type { UserInfo } from '@ybgnb/bili-api'

const visible = defineModel<boolean>({ required: true })
const props = withDefaults(defineProps<UserSelectDialogProps>(), {})
const options: UserSelectDialogProps = reactive(cloneDeep(props))

// 显示
const show = (newOptions?: Partial<UserSelectDialogProps>) => {
  Object.assign(options, newOptions)
  visible.value = true
}
// 隐藏
const hide = () => {
  visible.value = false
}

const userDialogVisible = ref(false)
const userStore = useUserStore()
const users = userStore.users

const handleCancel = () => {
  visible.value = false
  options.onCancel?.()
}

const handleSelect = (user: UserInfo) => {
  visible.value = false
  options.onSelected(user)
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
        <el-button type="primary" @click="userDialogVisible = true">登录新账号</el-button>
      </div>
      <div class="user-list">
        <BiliUserCard
          class="user-card"
          v-for="user in users"
          :key="user.mid"
          :user="user"
          @click="handleSelect(user)"
        ></BiliUserCard>
      </div>
    </div>
    <template #footer></template>
    <UserLoginDialog v-model="userDialogVisible" />
  </el-dialog>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: end;
}

.user-list {
  max-height: 300px;
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px 10px;
  box-sizing: border-box;

  .user-card {
    width: 100%;
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
