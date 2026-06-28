<script setup lang="ts" generic="T extends CardType">
import type { CardType } from '@/renderer/components/plugin/types.js'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import PluginCardSimple from '@/renderer/components/plugin/PluginCardSimple.vue'
import { toRaw } from 'vue'

const props = defineProps<{
  plugins: ToolkitPlugin[]
}>()
const emits = defineEmits<{
  click: [plugin: ToolkitPlugin]
}>()
const handleClick = (plugin: ToolkitPlugin) => {
  emits('click', toRaw(plugin))
}
</script>

<template>
  <div class="plugin-list">
    <plugin-card-simple v-for="plugin in props.plugins" :key="plugin.id" :plugin="plugin" @click="handleClick(plugin)">
      <template v-slot="{ plugin }">
        <slot :plugin="plugin"></slot>
      </template>
    </plugin-card-simple>
  </div>
</template>

<style scoped lang="scss">
.plugin-list {
  width: 100%;
  margin: 10px 0;
  padding-right: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
</style>
