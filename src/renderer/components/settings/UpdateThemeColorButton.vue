<script setup lang="ts">
import { useAppThemeStore } from '@/renderer/stores/app-theme'
import { ThemeUtils } from '@/renderer/utils/theme-utils'
import { AppConstants } from '@/shared/common/app-constants'
import { ref } from 'vue'
import { CountdownDialog } from 'bilitoolkit-ui'

// 保存的主题状态
const appThemeStore = useAppThemeStore()
const themeState = appThemeStore.state

// 预设的颜色
const predefineColors = ref(AppConstants.THEME.DEFAULT_PRIMARY_COLORS)
// 新的主题色
const selectedPrimaryColor = ref(themeState.primaryColor)
// 旧的主题色
let oldPrimaryColor = ''
// 倒计时可见
const countdownVisible = ref(false)

// 更新主题色
const updatePrimaryColor = () => {
  if (!selectedPrimaryColor.value) return
  // 尝试更新主题
  oldPrimaryColor = themeState.primaryColor
  ThemeUtils.updatePrimaryColor(selectedPrimaryColor.value)
  // 倒计时提示是否保存
  countdownVisible.value = true
}
const restoreTheme = () => {
  selectedPrimaryColor.value = oldPrimaryColor
  ThemeUtils.updatePrimaryColor(oldPrimaryColor)
}
</script>

<template>
  <el-color-picker v-model="selectedPrimaryColor" @change="updatePrimaryColor" :predefine="predefineColors" />
  <CountdownDialog
    v-model="countdownVisible"
    content="是否保存当前主题？"
    :countdown="10"
    @onCancel="restoreTheme"
  ></CountdownDialog>
</template>

<style scoped lang="scss"></style>
