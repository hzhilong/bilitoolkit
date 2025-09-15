<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'

const test = async () => {
  console.log('init db', await window.toolkitApi.db.init('dddd', { a: 1, b: 2 }))
  console.log('write file', await window.toolkitApi.file.write('ffff.txt', new TextEncoder().encode('你好')))
}
</script>

<template>
  <PageContainer>
    <el-button @click="test()">测试</el-button>
  </PageContainer>
</template>

<style scoped lang="scss"></style>
