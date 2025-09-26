<script setup lang="ts">
import { ref } from 'vue'
import SideBar from '@/renderer/components/layout/SideBar.vue'
import TopBar from '@/renderer/components/layout/TopBar.vue'
import { toolkitApi } from '@/renderer/api/toolkit-api.ts'
import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.ts'
import { CommonError, execBiz } from '@ybgnb/utils'

const mainContentRef = ref<HTMLElement>()

toolkitApi.global.register(HOST_GLOBAL_DATA.CONTENT_BOUNDS, () => {
  return execBiz(async () => {
    if (!mainContentRef.value) {
      throw new CommonError('内部错误：窗口未被加载')
    }
    const rect = mainContentRef.value.getBoundingClientRect()
    return {
      width: rect.width - 2,
      height: rect.height - 2,
      x: rect.x + 1,
      y: rect.y + 1,
    }
  })
})
</script>

<template>
  <div class="main-layout">
    <div class="left-layout">
      <SideBar />
    </div>
    <div class="right-layout">
      <TopBar class="top-bar" />
      <div class="main-content-border">
        <div ref="mainContentRef" class="main-content">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/abstracts/variables' as *;

.main-layout {
  width: 100%;
  height: 100%;
  display: flex;

  .left-layout {
    width: $sidebar-width;
    height: 100%;
    background: var(--app-bg-color-menus);
  }

  .right-layout {
    width: calc(100% - $sidebar-width);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    position: relative;

    /* 内容区域边框背景（mask设置，不应该内容区域的不透明背景叠加效果） */
    &:before {
      content: '';
      position: absolute;
      top: $top-bar-height;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--app-bg-color-menus);
      mask:
        linear-gradient(to bottom, #000, #000) content-box,
        linear-gradient(to bottom, #fff, #fff);
      mask-composite: exclude;
      padding-right: $main-content-border-width-rb;
      padding-bottom: $main-content-border-width-rb;
      pointer-events: none;
    }

    /* 内容区域圆角以外的背景（mask设置，不应该内容区域的不透明背景叠加效果） */
    &:after {
      content: '';
      position: absolute;
      top: calc($top-bar-height + 0px);
      left: 0;
      right: $main-content-border-width-rb;
      bottom: $main-content-border-width-rb;
      background: var(--app-bg-color-menus);
      padding: 10px;
      mask: url('@/renderer/assets/images/mask-main-content.svg'), linear-gradient(to bottom, #fff, #fff);
      mask-composite: exclude;
      mask-position: 0 0;
      mask-size: 100% 100%;
      mask-repeat: no-repeat;
      pointer-events: none;
    }
  }

  .top-bar {
    background: var(--app-bg-color-menus);
  }

  /* 内容边框 */
  .main-content-border {
    width: 100%;
    height: calc(100% - $top-bar-height);
    box-sizing: border-box;
    padding-right: $main-content-border-width-rb;
    padding-bottom: $main-content-border-width-rb;
  }

  /* 内容 */
  .main-content {
    width: 100%;
    height: 100%;
    border-radius: $main-content-border-radius;
    background: var(--app-bg-color-page);
    //border: 1px solid var(--app-color-primary-transparent-5);
    border: 1px solid $main-content-border-color;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
  }
}
</style>
