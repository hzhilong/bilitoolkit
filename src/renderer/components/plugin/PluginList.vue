<script setup lang="ts" generic="T extends CardType">
import PluginCard from '@/renderer/components/plugin/PluginCard.vue'
import type { PluginListProps, CardType } from '@/renderer/components/plugin/types.js'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.js'

const props = defineProps<PluginListProps<T>>()
</script>

<template>
  <div class="plugin-list">
    <plugin-card
      v-for="plugin in props.plugins"
      :key="plugin.id"
      :plugin="plugin as InstalledToolkitPlugin"
      :type="props.type"
      class="plugin-card"
    />
  </div>
</template>

<style scoped lang="scss">
.plugin-list {
  width: 100%;
  margin: 10px 0;
  padding-right: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  align-content: start;
}
</style>
