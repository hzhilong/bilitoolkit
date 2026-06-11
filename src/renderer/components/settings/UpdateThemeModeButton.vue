<script setup lang="ts">
import { switchThemeMode, useAppThemeStore } from 'bilitoolkit-ui'

const store = useAppThemeStore()
const state = store.state

const toggleTheme = async () => {
  await switchThemeMode(state.themeMode)
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
