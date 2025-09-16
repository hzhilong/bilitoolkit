<script setup lang="ts">
import { useAppThemeStore } from '@/renderer/stores/app-theme'
import {ThemeUtils} from '@/renderer/utils/theme-utils'

const state = useAppThemeStore().state

const toggleTheme = () => {
  ThemeUtils.toggleThemeMode(state.themeMode)
}
</script>

<template>
  <el-radio-group v-model="state.themeMode" @change="toggleTheme">
    <el-radio-button label="浅色" value="light" />
    <el-radio-button label="深色" value="dark" />
    <el-radio-button label="系统" value="system" />
  </el-radio-group>
</template>

<style scoped lang="scss"></style>
