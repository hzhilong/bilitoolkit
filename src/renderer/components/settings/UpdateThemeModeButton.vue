<script setup lang="ts">
import { useAppThemeStore } from '@/renderer/stores/app-theme'

const state = useAppThemeStore().state

const toggleTheme = () => {}
</script>

<template>
  <el-radio-group v-model="state.themeMode" @change="toggleTheme">
    <el-radio-button label="浅色" value="light" />
    <el-radio-button label="深色" value="dark" />
    <el-radio-button label="系统" value="system" />
  </el-radio-group>
</template>

<style scoped lang="scss"></style>
