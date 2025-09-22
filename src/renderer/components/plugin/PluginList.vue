<script setup lang="ts">
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import PluginCard from '@/renderer/components/plugin/PluginCard.vue'

const props = defineProps<{
  plugins: ToolkitPlugin[]
}>()
</script>

<template>
  <div class="plugin-list">
    <plugin-card class="plugin-card" v-for="plugin in plugins" v-bind="plugin" :key="plugin.id"></plugin-card>
  </div>
</template>

<style scoped lang="scss">
.plugin-list {
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  margin: 10px 0;
  box-sizing: border-box;
  padding: 10px 0;
  gap:10px 4%;

  .plugin-card {
    width: 46%;
    flex-grow: 0;
    flex-shrink: 0;
  }
}
</style>
