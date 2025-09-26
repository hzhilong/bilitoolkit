<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { useLoadingData } from 'bilitoolkit-ui'
import { ref } from 'vue'

const visible = ref(false)
const { loading, loadingData } = useLoadingData()
const test = loadingData(async () => {
  visible.value = true
})
</script>

<template>
  <PageContainer v-loading="loading">
    <el-button @click="test">测试登录账号</el-button>
  </PageContainer>
</template>

<style scoped lang="scss"></style>
