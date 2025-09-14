<script setup lang="ts">
import AppIcon from '@/renderer/components/common/AppIcon.vue'

defineProps<{
  icon: string
}>()
</script>

<template>
  <div class="icon-label">
    <AppIcon :icon="icon" />
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.icon-label {
  display: flex;
  align-items: center;

  > i {
    margin-right: 2px;
  }
}
</style>
