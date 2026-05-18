<script setup lang="ts">
import UserLoginDialog from '@/renderer/components/dialog/UserLoginDialog.vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/renderer/stores/user.js'
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { showConfirm, showToast, BiliUserCard, IconButton, showError } from 'bilitoolkit-ui'
import { toolkitApi } from '@/renderer/api/toolkit-api.js'
import UserCookieModal from '@/renderer/components/modal/UserCookieModal.vue'
import type { UserInfoWithCookie, UserCookie } from '@ybgnb/bili-api'
import { useRouter } from 'vue-router'
import { getErrorMessage } from '@ybgnb/utils'

const router = useRouter()
const userLoginDialogVisible = ref(false)
const userStore = useUserStore()
const users = userStore.users
const { loginUser, logoutUser, setUsers, refreshData } = userStore
const loading = ref(false)

const mouseuserId = ref<number | null>(null)
const optionsVisible = (uid: number) => {
  return mouseuserId.value != null && mouseuserId.value === uid
}
const logout = async (uid: number) => {
  await showConfirm('确认退出该账号吗？')
  await logoutUser(uid)
  showToast('退出成功')
}

onMounted(() => {
  toolkitApi.event.onUserLogout((user) => {
    console.log(`监听到用户退出`, user)
  })
})

const currCookie = ref<string>()
const currHandlingUser = ref<UserInfoWithCookie>()
const userCookieModalVisible = ref(false)

const handleAddCookie = () => {
  currHandlingUser.value = undefined
  currCookie.value = undefined
  userCookieModalVisible.value = true
}

const handleEditCookie = (user: UserInfoWithCookie) => {
  currHandlingUser.value = user
  currCookie.value = user.userCookie.cookie
  userCookieModalVisible.value = true
}

const handleOpenBili = async (user: UserInfoWithCookie) => {
  mouseuserId.value = null
  await toolkitApi.user.switchCurrUser(user)
  await router.push('/bili-space')
}

const handleCookieSubmit = async (userCookie: UserCookie) => {
  if (currHandlingUser.value) {
    currHandlingUser.value.userCookie = userCookie
    await loginUser(currHandlingUser.value)
  } else {
    try {
      const newUser = await toolkitApi.user.getMyInfoByCookie(userCookie)
      await loginUser(newUser)
      showToast(`成功添加用户 ${newUser.name} (${newUser.mid})`)
    } catch (e) {
      showError(`无效 cookie：${getErrorMessage(e)}`)
    }
  }
}
const syncAllUserInfo = async () => {
  loading.value = true
  const result = await toolkitApi.core.syncUserList(users)
  if (result.expiredList.length > 0) {
    showToast(`${result.updatedList.length}个用户信息已更新，${result.expiredList.length}个用户信息已失效`)
  } else {
    showToast(`${result.updatedList.length}个用户信息已更新`)
  }
  await setUsers(result.updatedList)
  loading.value = false
}
</script>

<template>
  <PageContainer>
    <div class="page-header">
      <el-button type="primary" @click="userLoginDialogVisible = true">登录新账号</el-button>
      <el-button type="primary" @click="handleAddCookie()">新增 cookie</el-button>
      <el-button type="primary" @click="refreshData">刷新</el-button>
      <el-button type="primary" @click="syncAllUserInfo">同步用户信息</el-button>
    </div>
    <div class="user-list-wrapper">
      <div class="user-list" v-loading="loading">
        <bili-user-card
          class="bili-user-card"
          v-for="user in users"
          :key="user.mid"
          :user="user"
          :show-logout-btn="true"
          @mouseenter="mouseuserId = user.mid"
          @mouseleave="mouseuserId = null"
        >
          <div class="options" v-if="optionsVisible(user.mid)">
            <IconButton icon="logout-box-r" tip="登出" @click="logout(user.mid)" />
            <IconButton icon="edit" tip="编辑" @click="handleEditCookie(user)" />
            <IconButton icon="chrome" @click="handleOpenBili(user)" />
          </div>
        </bili-user-card>
      </div>
    </div>
    <UserLoginDialog v-model="userLoginDialogVisible" />
    <UserCookieModal
      v-model="userCookieModalVisible"
      :cookie="currCookie"
      @submit="handleCookieSubmit"
    ></UserCookieModal>
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/user-manage';
</style>
