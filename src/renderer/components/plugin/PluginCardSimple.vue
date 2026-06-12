<script setup lang="ts">
import { usePluginIconBase64 } from '@/renderer/composables/usePluginIcon.js'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { AppTooltip } from 'bilitoolkit-ui'

const props = withDefaults(
  defineProps<{
    plugin: ToolkitPlugin
  }>(),
  {},
)

const { base64 } = usePluginIconBase64(() => props.plugin)
const emits = defineEmits<{
  click: []
}>()
const handleClick = () => {
  emits('click')
}
</script>

<template>
  <div class="plugin-card-simple" @click="handleClick">
    <img class="plugin-icon" :src="base64" alt="" />
    <div class="plugin-info">
      <div class="plugin-name">{{ plugin.name }}</div>
      <AppTooltip class="plugin-desc" :content="plugin.description" :lines="1"></AppTooltip>
    </div>
    <slot :plugin="plugin"></slot>
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/abstracts/mixins' as mixins;

.plugin-card-simple {
  @include mixins.card-tech-style;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;
  cursor: pointer;
  padding: 10px 16px;

  .plugin-icon {
    width: 36px;
    height: 36px;
  }

  .plugin-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .plugin-name {
      font-size: 16px;
      color: var(--el-text-color-primary);
      line-height: normal;
    }
    .plugin-desc {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      line-height: normal;
    }
  }
}
</style>
