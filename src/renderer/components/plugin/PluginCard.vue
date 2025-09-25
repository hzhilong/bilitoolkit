<script setup lang="ts" generic="T extends CardType">
import { IconButton, useLoadingData, AppUtils, IconLabel } from 'bilitoolkit-ui'
import { usePluginIconBase64 } from '@/renderer/composables/usePluginIcon.ts'
import { PluginUtils } from '@/renderer/utils/plugin-utils.ts'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.ts'
import type { PluginCardProps, CardType } from '@/renderer/components/plugin/types.ts'
import { computed } from 'vue'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

const props = withDefaults(defineProps<PluginCardProps<T>>(), {})

const { base64 } = usePluginIconBase64(props.plugin)
const { loading, loadingData } = useLoadingData()
const { hasInstalled } = useAppInstalledPlugins()
const isInstalled = hasInstalled(props.plugin)

const displayInstallDate = computed(() => {
  if (props.type === 'market') {
    return ``
  } else {
    return `安装日期: ${(props.plugin as InstalledToolkitPlugin).installDate}`
  }
})
const displayInstallSize = computed(() => {
  if (props.type === 'market') {
    return ``
  } else {
    return `插件大小: ${(props.plugin as InstalledToolkitPlugin).files.sizeDesc}`
  }
})

const installPlugin = () => {
  loadingData(async () => {
    await PluginUtils.install(props.plugin)
    AppUtils.message('插件安装成功')
  })
}
const updatePlugin = () => {
  loadingData(async () => {
    await PluginUtils.install(props.plugin)
    AppUtils.message('插件更新成功')
  })
}
</script>

<template>
  <div class="plugin-card" v-loading="loading">
    <img class="plugin-icon" :src="base64" alt="" />
    <div class="plugin-infos">
      <div class="infos-header">
        <div class="title">
          <div class="plugin-name">{{ plugin.name }}</div>
        </div>
        <div class="sub-title">
          <icon-label icon="puzzle">id: {{ plugin.id }}</icon-label>
          <icon-label icon="git-commit">版本: {{ plugin.version }}</icon-label>
        </div>
      </div>
      <div class="infos-author">
        <icon-label icon="user">作者: {{ plugin.author }}</icon-label>
        <icon-label icon="calendar-2">更新日期: {{ plugin.date }}</icon-label>
      </div>
      <template v-if="type === 'manage'">
        <div class="installed-infos">
          <icon-label icon="file">{{ displayInstallSize}}</icon-label>
          <icon-label icon="file">{{ displayInstallDate}}</icon-label>
        </div>
      </template>
      <div class="plugin-description">
        {{ plugin.description }}
      </div>
      <div class="options">
        <el-popconfirm v-if="!isInstalled" title="确认安装吗？" @confirm="installPlugin">
          <template #reference>
            <el-button>安装</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm v-else title="确认更新吗？" @confirm="updatePlugin">
          <template #reference>
            <el-button>更新</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/global.scss' as *;

.plugin-card {
  @include card-tech-style;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  border: 2px solid var(--el-border-color);
  border-radius: 12px;
  padding: 10px 10px;
  box-sizing: border-box;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-placeholder);
  text-wrap: nowrap;
  gap: 6px;

  ::v-deep(.icon-font) {
    font-size: 14px;
    line-height: 14px;
    color: var(--el-color-primary-light-4);
  }

  .plugin-icon {
    display: inline-block;
    user-select: none;
    margin-top: 6px;
    width: 36px;
    height: 36px;
  }

  .plugin-infos {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

    & > * {
      width: 100%;
    }
  }

  .infos-header {
    display: flex;
    flex-direction: column;
    text-wrap: nowrap;

    .title {
      display: flex;
      align-items: center;
      gap: 4px;

      .plugin-name {
        font-size: 18px;
        color: var(--el-text-color-primary);
      }
    }

    .sub-title {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }
  }

  .infos-author{
  }

  .infos-author,.installed-infos {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    gap: 10px;
  }

  .plugin-description{
    font-size: 14px;
    color: var(--el-text-color-secondary);
    border-top: 1px solid var(--el-border-color-light);
    padding-top: 4px;
    margin-top: 6px;
  }

  .options{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid var(--el-border-color-light);
    padding-top: 4px;
    margin-top: 6px;
  }
}
</style>
