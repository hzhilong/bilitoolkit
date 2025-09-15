<script setup lang="ts">

import PageContainer from '@/renderer/components/layout/PageContainer.vue'
</script>

<template>
  <PageContainer>
    <el-button @click="$toolkitApi.core.openLogsFolder()">测试</el-button>
  </PageContainer>
</template>

<style scoped lang="scss">
</style>
