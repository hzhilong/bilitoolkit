<script setup lang="ts" generic="T extends CardType">
import { IconLabel, showToast, useLoadingData, AppTooltip } from 'bilitoolkit-ui'
import { usePluginIconBase64 } from '@/renderer/composables/usePluginIcon.js'
import { PluginUtils } from '@/renderer/utils/plugin-utils.js'
import { useAppInstalledPlugins } from '@/renderer/stores/installed-plugins'
import type { CardType, PluginCardProps } from '@/renderer/components/plugin/types.js'
import { computed, ref } from 'vue'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import PluginInfoDialog from '@/renderer/components/plugin/PluginInfoDialog.vue'
import { useStarredPluginsStore } from '@/renderer/stores/starred-plugins'
import { appEnv } from '@ybgnb/vite-env/common'

const props = withDefaults(defineProps<PluginCardProps<T>>(), {})

const { base64 } = usePluginIconBase64(() => props.plugin)
const { loading, loadingData: WrappedLoad } = useLoadingData({
  singleFlight: true,
})
const { hasInstalled } = useAppInstalledPlugins()
const isInstalled = computed(() => hasInstalled(props.plugin.id))
const { isStarred, addStar, removeStar } = useStarredPluginsStore()
const star = computed(() => isStarred(props.plugin.id))
const showInfoDialog = ref(false)

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
const openPlugin = WrappedLoad(() => {
  PluginUtils.openPluginView(props.plugin as InstalledToolkitPlugin)
})
const installConfirm = computed(() => {
  if (appEnv.APP_AUTHOR === props.plugin.author) {
    return '确认安装吗？'
  } else {
    return '该插件非工具姬作者开发，确认安装吗？'
  }
})
const installPlugin = WrappedLoad(async () => {
  await PluginUtils.install(props.plugin)
  showToast('插件安装成功')
})
const updatePlugin = WrappedLoad(async () => {
  await PluginUtils.update(props.plugin)
  showToast('插件更新成功')
})
const uninstallPlugin = WrappedLoad(async () => {
  await PluginUtils.uninstall(props.plugin as InstalledToolkitPlugin)
  showToast('插件卸载成功')
})
const starPlugin = () => {
  if (star.value) {
    removeStar(props.plugin.id)
  } else {
    addStar(props.plugin.id)
  }
}
</script>

<template>
  <div class="plugin-card" v-loading="loading" :class="type === 'no-options' ? 'not-tech-style' : ''">
    <span v-if="type !== 'no-options' && isInstalled" class="badge tag-installed"></span>
    <img class="plugin-icon" :src="base64" alt="" />
    <div class="plugin-infos">
      <div class="infos-header">
        <div class="title">
          <div class="plugin-name">{{ plugin.name }}</div>
          <div v-if="plugin.type === 'task'" class="plugin-task-flag">定时任务</div>
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
      <AppTooltip class="plugin-description" :content="plugin.description" :lines="2"> </AppTooltip>
      <div class="options" v-if="type !== 'no-options'">
        <i
          v-if="type == 'manage'"
          class="star-btn"
          :class="star ? 'ri-star-fill' : 'ri-star-line'"
          @click="starPlugin"
        ></i>
        <el-button @click="showInfoDialog = true" size="small">查看</el-button>
        <el-button v-if="isInstalled" @click="openPlugin" size="small">打开</el-button>
        <el-popconfirm v-if="!isInstalled" :title="installConfirm" @confirm="installPlugin">
          <template #reference>
            <el-button size="small">安装</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm v-else title="确认更新吗？" @confirm="updatePlugin">
          <template #reference>
            <el-button size="small">更新</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm v-if="isInstalled" title="确认卸载吗？" @confirm="uninstallPlugin">
          <template #reference>
            <el-button size="small">卸载</el-button>
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
  min-width: 340px;
  max-width: 500px;
  height: max-content;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  border-radius: 12px;
  padding: 10px 10px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-placeholder);
  text-wrap: nowrap;
  gap: 6px;
  position: relative;
  transition: transform 0.3s ease;

  ::v-deep(.icon-font) {
    font-size: 14px;
    line-height: 14px;
    color: var(--el-color-primary-light-4);
  }

  &.not-tech-style {
    &:hover {
      transform: translateY(-1px);
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
    width: 0;
    overflow: hidden;
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

      .plugin-task-flag {
        font-size: 12px;
        margin-left: 4px;
        border-radius: 4px;
        padding: 0 3px;
        color: var(--app-color-primary-transparent-55);
        border: 1px solid var(--app-color-primary-transparent-55);
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
    text-wrap: auto;
    line-height: 1.5em;
    height: calc(1.5em * 2);
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
      width: 24px;
      height: 24px;
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
    right: 0;
    top: 0;
    width: 30px;
    height: 30px;
    clip-path: polygon(100% 0, 100% 100%, 0 0);

    &::before {
      content: '';
      position: absolute;
      right: 5px;
      top: 5px;
      width: 10px;
      height: 5px;
      border-left: 2px solid var(--app-color-primary-transparent-55);
      border-bottom: 2px solid var(--app-color-primary-transparent-55);
      transform: rotate(-45deg);
      transform-origin: center;
      z-index: 1;
    }
  }
}
</style>
