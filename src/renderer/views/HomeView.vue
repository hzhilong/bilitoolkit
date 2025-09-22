<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { PluginUtils } from '@/renderer/utils/plugin-utils.ts'

const test2 = async () => {
  console.log(await PluginUtils.searchPlugins())
}
</script>

<template>
  <PageContainer>
    <el-button @click="test2()">测试1</el-button>
  </PageContainer>
</template>

<style scoped lang="scss"></style>
