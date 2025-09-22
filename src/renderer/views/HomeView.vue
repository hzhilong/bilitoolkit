<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { PluginUtils } from '@/renderer/utils/plugin-utils.ts'
import { AppUtils } from '@/renderer/utils/app-utils.ts'

let num = 0
const test1 = async () => {
  num = (num % 4) + 1
  console.log(
    'host test 结果',
    PluginUtils.openPluginView({
      id: `dev-bilitoolkit-plugin-${num}`,
      name: `-------------开发调试---------------------------${num}`,
      indexPath: 'http://localhost:5174',
    }),
  )
}
const test2 = async () => {
  AppUtils.message('test')
}
</script>

<template>
  <PageContainer>
    <el-button @click="test1()">测试1</el-button>
  </PageContainer>
</template>

<style scoped lang="scss"></style>
