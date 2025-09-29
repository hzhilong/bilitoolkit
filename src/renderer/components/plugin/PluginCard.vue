<script setup lang="ts" generic="T extends CardType">
import { AppUtils, IconLabel, useLoadingData } from 'bilitoolkit-ui'
import { usePluginIconBase64 } from '@/renderer/composables/usePluginIcon.ts'
import { PluginUtils } from '@/renderer/utils/plugin-utils.ts'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.ts'
import type { CardType, PluginCardProps } from '@/renderer/components/plugin/types.ts'
import { computed, ref } from 'vue'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import PluginInfoDialog from '@/renderer/components/plugin/PluginInfoDialog.vue'
import { usePluginStarsStore } from '@/renderer/stores/plugin-stars.ts'
import { appEnv } from '@/shared/common/app-env.ts'

const props = withDefaults(defineProps<PluginCardProps<T>>(), {})

const { base64 } = usePluginIconBase64(props.plugin)
const { loading, loadingData } = useLoadingData()
const { hasInstalled } = useAppInstalledPlugins()
const isInstalled = hasInstalled(props.plugin)
const showInfoDialog = ref(false)
const { hasStar, addStar, delStar } = usePluginStarsStore()

const star = hasStar(props.plugin.id)

const displayInstallDate = computed(() => {
  if (props.type === 'manage') {
    return `安装日期: ${(props.plugin as InstalledToolkitPlugin).installDate}`
  } else {
    return ``
  }
})
const displayInstallSize = computed(() => {
  if (props.type === 'manage') {
    return `插件大小: ${(props.plugin as InstalledToolkitPlugin).files.sizeDesc}`
  } else {
    return ``
  }
})
const openPlugin = () => {
  PluginUtils.openPluginView(props.plugin)
}
const installConfirm = computed(() => {
  if (appEnv.env.APP_AUTHOR === props.plugin.author) {
    return '确认安装吗？'
  } else {
    return '该插件非工具姬作者开发，确认安装吗？'
  }
})
const installPlugin = loadingData(async () => {
  await PluginUtils.install(props.plugin)
  AppUtils.message('插件安装成功')
})
const updatePlugin = loadingData(async () => {
  await PluginUtils.install(props.plugin)
  AppUtils.message('插件更新成功')
})
const uninstallPlugin = loadingData(async () => {
  await PluginUtils.uninstall(props.plugin as InstalledToolkitPlugin)
  AppUtils.message('插件卸载成功')
})
const starPlugin = () => {
  if (star.value) {
    delStar(props.plugin.id)
  } else {
    addStar(props.plugin.id)
  }
}
</script>

<template>
  <div class="plugin-card" v-loading="loading" :class="type === 'no-options' ? 'not-tech-style' : ''">
    <span v-if="type !== 'no-options' && isInstalled" class="badge tag-installed">已安装</span>
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
        <icon-label icon="calendar-2">发布日期: {{ plugin.date }}</icon-label>
      </div>
      <template v-if="type === 'manage'">
        <div class="installed-infos">
          <icon-label icon="file">{{ displayInstallSize }}</icon-label>
          <icon-label icon="file">{{ displayInstallDate }}</icon-label>
        </div>
      </template>
      <div class="plugin-description">
        {{ plugin.description }}
      </div>
      <div class="options" v-if="type !== 'no-options'">
        <i
          v-if="type == 'manage'"
          class="star-btn"
          :class="star ? 'ri-star-fill' : 'ri-star-line'"
          @click="starPlugin"
        ></i>
        <el-button @click="showInfoDialog = true">查看</el-button>
        <el-button v-if="isInstalled" @click="openPlugin">打开</el-button>
        <el-popconfirm v-if="!isInstalled" :title="installConfirm" @confirm="installPlugin">
          <template #reference>
            <el-button>安装</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm v-else title="确认更新吗？" @confirm="updatePlugin">
          <template #reference>
            <el-button>更新</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm v-if="isInstalled" title="确认卸载吗？" @confirm="uninstallPlugin">
          <template #reference>
            <el-button>卸载</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
    <PluginInfoDialog v-bind="plugin" v-model="showInfoDialog" />
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/abstracts/mixins' as mixins;

.plugin-card {
  @include mixins.card-tech-style;
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
  position: relative;

  ::v-deep(.icon-font) {
    font-size: 14px;
    line-height: 14px;
    color: var(--el-color-primary-light-4);
  }

  &.not-tech-style {
    &:hover {
      box-shadow: var(--el-box-shadow);
    }
    &::before {
      content: unset;
    }
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

  .infos-author {
  }

  .infos-author,
  .installed-infos {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    gap: 10px;
  }

  .plugin-description {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    border-top: 1px solid var(--el-border-color-light);
    padding-top: 4px;
    margin-top: 6px;
  }

  .options {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid var(--el-border-color-light);
    padding-top: 4px;
    margin-top: 6px;

    .star-btn {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-right: auto;
      font-size: 16px;
      line-height: 16px;
      padding: 4px;
      border-radius: 50%;
      color: var(--app-color-primary-transparent-75);

      &:hover {
        cursor: pointer;
        background-color: var(--app-color-primary-transparent-15);
      }
    }
  }

  .badge {
    position: absolute;
    background: var(--app-color-primary-transparent-15);
    color: var(--app-color-primary-transparent-55);
    right: -21px;
    top: -5px;
    font-size: 10px;
    line-height: 14px;
    text-align: center;
    padding: 15px 15px 0 15px;
    transform: rotate(45deg);
    user-select: none;
    font-family: Arial, Helvetica, sans-serif;
  }
}
</style>
