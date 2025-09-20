<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AppIcon } from 'bilitoolkit-ui'

/**
 * 应用菜单
 */
export interface MenuProp {
  menus: MenuItem[]
}

export interface MenuItem {
  icon: string
  title: string
  path: string
  onclick?: () => void
}

const props = withDefaults(defineProps<MenuProp>(), {})

const router = useRouter()
const menuIndex = ref(0)

watch(
  () => router.currentRoute.value.path,
  async () => {
    const currPath = router.currentRoute.value.path
    const findIndex = props.menus.findIndex((menu) => currPath.startsWith(menu.path))
    menuIndex.value = findIndex > -1 ? findIndex : 0
  },
  { immediate: true },
)

const menuItemClass = (item: MenuItem, index: number) => {
  return menuIndex.value === index ? 'menu__item--active' : ''
}

const handleMenuItemClick = async (event: MouseEvent, menu: MenuItem, index: number) => {
  // TODO 点击其他菜单时隐藏当前插件页面
  menuIndex.value = index
  if (menu.onclick) {
    menu.onclick()
  } else {
    await router.push({
      path: menu.path,
    })
  }
}
</script>

<template>
  <div class="menu">
    <div
      class="menu__item"
      v-for="(item, index) in menus"
      :key="item.path"
      :class="menuItemClass(item, index)"
      @click="handleMenuItemClick($event, item, index)"
    >
      <AppIcon class="menu__item__icon" :icon="item.icon" />
      <span class="menu__item__text">{{ item.title }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/global' as *;

.menu {
  $menus-padding-x: 10px;
  $menus-padding-y: 10px;
  $menu-hover-translate-x: 10px;

  width: 100%;
  flex: 1;
  letter-spacing: 1px;
  padding: $menus-padding-y calc($menus-padding-x + $menu-hover-translate-x) $menus-padding-y $menus-padding-x;
  box-sizing: border-box;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__item {
    width: 100%;
    padding: 5px 12px 5px 14px;
    box-sizing: border-box;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--app-color-menu);
    background: var(--app-bg-menu);
    background-size: 200% 100%;
    background-position: 100% 0;
    position: relative;
    overflow: hidden;
    font-size: 16px;
    font-weight: 500;

    &__icon {
      margin-right: 8px;
      margin-top: 2px;
      color: var(--app-color-menu-icon);
    }

    &:hover {
      transform: translateX($menu-hover-translate-x);
      color: var(--app-color-menu-hover);
      background: var(--app-bg-menu-hover);
      background-size: 200% 100%;
      background-position: 0 0;
      box-shadow: var(--app-shadow-menu-hover);

      &__icon {
        color: var(--app-color-menu-icon-hover);
      }
    }

    &--active {
      color: var(--app-color-menu-active);
      background: var(--app-bg-menu-active);

      &:before {
        left: 0;
        opacity: 1;
      }

      &:hover {
        box-shadow: var(--app-shadow-menu-active-hover);
      }

      &__icon {
        color: var(--app-color-menu-icon-active);
      }
    }

    &:before {
      content: '';
      position: absolute;
      left: -10px;
      top: 0;
      height: 100%;
      width: 3px;
      border-radius: 8px 0 0 8px;
      background: var(--app-bg-menu-tag);
      transition: all 0.3s ease;
      opacity: 0;
    }
  }
}
</style>
