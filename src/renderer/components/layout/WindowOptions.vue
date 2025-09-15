<script setup lang="ts">
/**
 * 窗口按钮
 */
import { storeToRefs } from 'pinia'
import { useAppSessionStore } from '@/renderer/stores/app-session.ts'

const { maxWindow } = storeToRefs(useAppSessionStore())
const switchWindowMax = () => {
  maxWindow.value = !maxWindow.value
  toolkitApi.window.maximize(maxWindow.value)
}
</script>

<template>
  <div class="window-options">
    <span class="window-options__item icon-minimize" @click="$toolkitApi.window.minimize()" />
    <span
      class="window-options__item"
      :class="maxWindow ? 'icon-cancel-maximize' : 'icon-maximize'"
      @click="switchWindowMax"
    ></span>
    <span class="window-options__item icon-close" @click="$toolkitApi.window.close()"></span>
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/global' as *;

.window-options {
  width: fit-content;
  margin-left: auto;
  -webkit-app-region: no-drag;
  margin-bottom: auto;

  &__item {
    display: inline-block;
    width: 30px;
    height: 30px;
    box-sizing: border-box;
    text-align: center;
    user-select: none;
    cursor: pointer;
    position: relative;

    $padding-base: 8px;

    &.icon-minimize {
      @include pseudo-svg-icon(url('@/renderer/assets/images/icon-minimize.svg'), var(--el-text-color-primary), $padding-base);
    }

    &.icon-maximize {
      @include pseudo-svg-icon(url('@/renderer/assets/images/icon-maximize.svg'), var(--el-text-color-primary), $padding-base);
    }

    &.icon-cancel-maximize {
      @include pseudo-svg-icon(
        url('@/renderer/assets/images/icon-cancel-maximize.svg'),
        var(--el-text-color-primary),
        $padding-base
      );
    }

    &.icon-close {
      @include pseudo-svg-icon(url('@/renderer/assets/images/icon-close.svg'), var(--el-text-color-primary), $padding-base);
    }

    &:hover {
      background: var(--el-color-primary-light-4);
    }
  }
}
</style>
