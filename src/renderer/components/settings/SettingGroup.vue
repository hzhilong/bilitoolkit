<script setup lang="ts">
const props = defineProps<{
  name: string
}>()
</script>

<template>
  <div class="setting-group">
    <div class="setting-group__name">{{ props.name }}</div>
    <div class="setting-group__list">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.setting-group {
  border-radius: 8px;
  max-width: 800px;

  &__name {
    font-size: 18px;
    color: var(--el-text-color-primary);
    font-weight: bold;
    padding-left: 4px;
    margin-bottom: 8px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
