<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { AppLoadingDialog } from 'bilitoolkit-ui'

const test = async () => {
  await AppLoadingDialog.show({
    loadingText: '测试...',
    autoCloseDelay: 5000,
  })
}
</script>

<template>
  <PageContainer>
    <el-button @click="test()">测试</el-button>
  </PageContainer>
</template>

<style scoped lang="scss"></style>
