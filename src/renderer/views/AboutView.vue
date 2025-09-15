<script setup lang="ts">
import { rendererEnv } from '@/renderer/common/renderer-env'
import { useAppThemeStore } from '@/renderer/stores/app-theme'
import {ThemeUtils} from '@/renderer/utils/theme-utils'
import type { AppThemeMode } from 'bilitoolkit-api-types';
import type { Ref } from 'vue'
import { computed } from 'vue'
import PageContainer from '@/renderer/components/layout/PageContainer.vue'

const env = rendererEnv.env()
const appVersion = env.PROD ? env.APP_VERSION : `${env.APP_VERSION} ${env.MODE}`

const state = useAppThemeStore().state
const themeToggleMap: Record<AppThemeMode, AppThemeMode> = {
  dark: 'light',
  light: 'dark',
  system: 'light',
}

const newThemeMode: Ref<AppThemeMode> = computed(() => {
  return themeToggleMap[state.themeMode] || 'light'
})
</script>
<template>
  <PageContainer class="page-container">
    <div class="about">
      <div class="about__app-logo" @click="ThemeUtils.switchDefaultTheme()"></div>
      <div class="about__app-title" @click="ThemeUtils.toggleThemeMode(newThemeMode)">{{ env.APP_PRODUCT_NAME }}</div>
      <div class="about__info-list">
        <div class="about__info-list__item">
          <span class="about__info-list__item__title">名称：</span>
          <span class="about__info-list__item__desc">{{ env.APP_PRODUCT_CN_NAME }}</span>
        </div>
        <div class="about__info-list__item">
          <span class="about__info-list__item__title">版本：</span>
          <span class="about__info-list__item__desc">{{ appVersion }}</span>
        </div>
        <div class="about__info-list__item">
          <span class="about__info-list__item__title">描述：</span>
          <span class="about__info-list__item__desc">{{ env.APP_DESCRIPTION }}</span>
        </div>
        <div class="about__info-list__item">
          <span class="about__info-list__item__title">作者：</span>
          <span class="about__info-list__item__desc">{{ env.APP_AUTHOR }}</span>
        </div>
        <div class="about__info-list__item">
          <span class="about__info-list__item__title">开源：</span>
          <span
            class="about__info-list__item__desc url"
          >{{ env.APP_PRODUCT_URL }}</span
          >
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
@use '@/renderer/assets/scss/pages/about';
</style>
