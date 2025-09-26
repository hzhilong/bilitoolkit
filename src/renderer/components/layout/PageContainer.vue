<script setup lang="ts">
</script>

<template>
  <div class="page-container">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/abstracts/variables' as *;

.page-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-items: start;
  padding: 16px;
  box-sizing: border-box;
  color: var(--el-text-color-regular);
  border-radius: $main-content-border-radius;
  overflow: hidden;

  > :only-child {
    border-radius: $main-content-border-radius;
    overflow: hidden;
  }
}
</style>
