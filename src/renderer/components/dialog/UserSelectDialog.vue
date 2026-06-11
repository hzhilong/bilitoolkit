<script setup lang="ts">
import UserLoginDialog from '@/renderer/components/dialog/UserLoginDialog.vue'
import { cloneDeep } from 'lodash-es'
import { reactive, ref, watchEffect, onMounted } from 'vue'
import type { UserSelectDialogProps } from '@/renderer/components/dialog/types.js'
import { useUserStore } from '@/renderer/stores/user.js'
import type { UserInfoWithCookie } from '@ybgnb/bili-api'
import { BiliUserCard } from 'bilitoolkit-ui'

const visible = defineModel<boolean>({ required: true })
const props = withDefaults(defineProps<UserSelectDialogProps>(), {})
const options: UserSelectDialogProps = reactive(cloneDeep(props))
const users = ref<UserInfoWithCookie[]>()
const emptyMessage = ref<string>('当前未登录用户')

// 显示
const show = (newOptions?: Partial<UserSelectDialogProps>) => {
  Object.assign(options, newOptions)
  emptyMessage.value = newOptions?.emptyMessage ?? '当前未登录用户'
  visible.value = true
}
// 隐藏
const hide = () => {
  visible.value = false
}

const userDialogVisible = ref(false)
const userStore = useUserStore()

watchEffect(() => {
  users.value = options.disableUserList
    ? userStore.users.filter((user) => !options.disableUserList?.some((u) => u.mid === user.mid))
    : userStore.users
})

onMounted(() => {
  users.value = userStore.users
})

const handleCancel = () => {
  options.onCancel?.()
  visible.value = false
}

const handleSelect = (user: UserInfoWithCookie) => {
  options.onSelected(user)
  visible.value = false
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
    align-center
  >
    <div class="content-container">
      <div class="header">
        <el-button type="primary" @click="userDialogVisible = true">登录新账号</el-button>
      </div>
      <div class="user-list" v-if="users && users.length > 0">
        <BiliUserCard
          class="user-card"
          v-for="user in users"
          :key="user.mid"
          :user="user"
          @click="handleSelect(user)"
        ></BiliUserCard>
      </div>
      <el-empty v-if="!users || users.length === 0" :description="emptyMessage" />
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
  padding: 10px 0;
}

.user-list {
  max-height: 400px;
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  row-gap: 16px;
  justify-content: center;
  box-sizing: border-box;

  .user-card {
    width: 100%;
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
