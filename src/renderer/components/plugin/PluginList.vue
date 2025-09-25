<script setup lang="ts" generic="T extends CardType">
import PluginCard from '@/renderer/components/plugin/PluginCard.vue'
import type { PluginListProps, CardType } from '@/renderer/components/plugin/types.ts'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

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
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  margin: 10px 0;
  box-sizing: border-box;
  padding: 10px 0;
  gap: 10px 4%;

  .plugin-card {
    width: 46%;
    flex-grow: 0;
    flex-shrink: 0;
  }
}
</style>
