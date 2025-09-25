<script setup lang="ts">
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import { marked } from 'marked'
import { ExternalLink } from 'bilitoolkit-ui'

const props = defineProps<ToolkitPlugin>()
const visible = defineModel<boolean>({ required: true })
const readMeData = ref('加载 ReadMe.md 中...')
const title = computed(()=>{
  return `${props.name}  ${props.id}`
})
watch(visible, async (newValue) => {
  if (!newValue || !props || !props.id || !props.version) {
    return
  }
  const url = `https://cdn.jsdelivr.net/npm/${props.id}@${props.version}/README.md`
  readMeData.value = await marked((await axios.get(url)).data)
})
</script>

<template>
  <!-- 只留一个右上角的关闭按钮 -->
  <el-dialog v-model="visible" :title="title" width="min(800px, 80%)" :append-to-body="true">
    <div class="content">
      <div class="pkg-infos">
        <div class="info">作者：{{ author }}</div>
        <div class="info">版本：{{ version }}</div>
        <div class="info">发布日期：{{ date }}</div>
      </div>
      <div class="pkg-infos">
        <ExternalLink :url="links.npm">{{ links.npm }}</ExternalLink>
      </div>
      <div class="readme" v-html="readMeData"></div>
    </div>
    <template #footer> </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.content {
  width: 100%;

  .pkg-infos {
    width: 100%;

    display: flex;
    align-content: center;
    gap: 20px;
  }
}
</style>
