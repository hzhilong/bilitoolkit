<!--标题栏-->
<script setup lang="ts">
import WindowOptions from '@/renderer/components/layout/WindowOptions.vue'
import PluginTabControls from '@/renderer/components/layout/PluginTabControls.vue'
</script>

<template>
  <div class="top-bar">
    <PluginTabControls/>
    <WindowOptions class="top-bar__options" />
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/global' as *;

.top-bar {
  width: 100%;
  height: $top-bar-height;
  display: flex;
  align-items: center;
  -webkit-app-region: drag;
  user-select: none;
  padding-left: 10px;
  box-sizing: border-box;
  gap: 40px;

  &__title {
    margin: 0 auto;
  }

  &__options {
    flex-shrink: 0;
    flex-grow: 0;
    -webkit-app-region: no-drag;
  }
}
</style>
