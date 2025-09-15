<script setup lang="ts">
import { appMenus } from '@/renderer/router/menus'
import { ref } from 'vue'
import AppMenus, { type MenuProp } from './AppMenus.vue'

const menu = ref<MenuProp>({
  menus: appMenus,
})

const appName = import.meta.env.APP_PRODUCT_CN_NAME
</script>

<template>
  <div class="sidebar">
    <div class="sidebar__app-info">
      <div class="sidebar__app-info__logo"></div>
      <div class="sidebar__app-info__title" :data-content="appName">
        {{ appName }}
      </div>
    </div>
    <div class="sidebar__menu">
      <AppMenus v-bind="menu" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/global' as *;

.sidebar {
  width: 100%;
  height: 100%;
  padding-bottom: 4px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;

  &__app-info {
    width: 100%;
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 15px 0 15px 20px;
    -webkit-app-region: drag;

    &__logo {
      @include app-logo-style(var(--el-color-primary-light-1));
      width: 28px;
      height: 28px;
      margin-right: 2px;
    }

    &__title {
      font-size: 18px;
      color: var(--el-color-primary-light-1);
      font-weight: bold;
    }
  }

  &__menu {
    flex: 1;
    width: 100%;
    overflow-y: auto;
  }
}

</style>
