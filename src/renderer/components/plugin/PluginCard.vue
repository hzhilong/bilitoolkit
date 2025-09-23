<script setup lang="ts">
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { IconButton } from 'bilitoolkit-ui'
import { onMounted, ref, unref } from 'vue'
import { toolkitApi } from '@/renderer/api/toolkit-api.ts'
import { cloneDeep } from 'lodash'

const props = withDefaults(defineProps<ToolkitPlugin>(), {})
const iconSrc = ref('')
const loadPluginIcon = async () => {
  iconSrc.value = await toolkitApi.core.getPluginIcon(cloneDeep(unref(props)))
}
onMounted(() => {
  loadPluginIcon()
})
</script>

<template>
  <div class="plugin-card">
    <img class="icon" :src="iconSrc" />
    <div class="plugin-info">
      <div class="meta-info">
        <span class="name">
          {{ name }}
          <span class="version">
            {{ version }}
          </span>
        </span>
        <span class="date">
          {{ date }}
        </span>
      </div>
      <div class="meta-info">
        <span class="id">
          {{ id }}
        </span>
        <span class="author">
          {{ author }}
        </span>
      </div>
      <div class="description">
        {{ description }}
      </div>
    </div>
    <div class="options">
      <icon-button icon="install" confirm="确认安装？"></icon-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/global.scss' as *;

.plugin-card {
  display: flex;
  border: 2px solid var(--el-border-color);
  border-radius: 12px;
  padding: 10px 10px;
  box-sizing: border-box;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-placeholder);
  align-items: flex-start;
  gap: 6px;

  .icon {
    display: inline-block;
    user-select: none;
    width: 36px;
    height: 36px;
  }

  .plugin-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .options {
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    font-size: 26px;
  }

  .name {
    font-size: 16px;
    color: var(--el-text-color-primary);
  }
  .version {
    color: var(--el-text-color-regular);
  }

  .description {
    width: 100%;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    margin-top: 4px;
    line-height: 1.3;
  }

  .meta-info {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
