<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRecentPluginsStore } from '@/renderer/stores/recent-plugins'
import PluginListSimple from '@/renderer/components/plugin/PluginListSimple.vue'
import { PluginUtils } from '@/renderer/utils/plugin-utils'
import { useStarredPluginsStore } from '@/renderer/stores/starred-plugins'
import type { InstalledToolkitPlugin, ToolkitPlugin, PluginType } from '@/shared/types/toolkit-plugin'
import { useAppInstalledPlugins } from '@/renderer/stores/installed-plugins'

const router = useRouter()
const gotoStarred = async () => {
  await router.push({
    path: 'manage',
    query: {
      starred: 1,
    },
  })
}
const gotoRecent = async () => {
  await router.push({
    path: 'recent',
  })
}
const gotoPlugin = async (type: '' | PluginType = '') => {
  await router.push({
    path: 'manage',
    query: {
      type,
    },
  })
}
const { installedPlugins } = storeToRefs(useAppInstalledPlugins())
const uiPluginCount = computed(() => installedPlugins.value.filter((plugin) => plugin.type === 'ui').length)
const taskPluginCount = computed(() => installedPlugins.value.filter((plugin) => plugin.type === 'task').length)
const { recentPlugins } = storeToRefs(useRecentPluginsStore())
const recentPluginsPreview = computed(() => recentPlugins.value.slice(0, 6))
const { starredPlugins } = storeToRefs(useStarredPluginsStore())
const starredPluginsPreview = computed(() => starredPlugins.value.slice(0, 6))
const handleOpenPlugin = (plugin: ToolkitPlugin) => {
  PluginUtils.openPluginView(plugin as InstalledToolkitPlugin)
}
</script>

<template>
  <PageContainer>
    <div class="stats">
      <div class="card" @click="gotoPlugin()">
        <div class="stat-value">{{ installedPlugins.length }}</div>
        <div class="stat-label">已安装插件</div>
      </div>

      <div class="card" @click="gotoPlugin('ui')">
        <div class="stat-value">{{ uiPluginCount }}</div>
        <div class="stat-label">UI 插件</div>
      </div>

      <div class="card" @click="gotoPlugin('task')">
        <div class="stat-value">{{ taskPluginCount }}</div>
        <div class="stat-label">任务插件</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header" @click="gotoRecent">最近使用</div>
      <div class="section-body">
        <template v-if="recentPluginsPreview.length">
          <plugin-list-simple :plugins="recentPluginsPreview" @click="handleOpenPlugin" />
        </template>
        <div v-else class="empty">暂无最近使用记录</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header" @click="gotoStarred">收藏插件</div>
      <div class="section-body">
        <template v-if="starredPluginsPreview.length">
          <plugin-list-simple :plugins="starredPluginsPreview" @click="handleOpenPlugin" />
        </template>
        <div v-else class="empty">暂无收藏插件</div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.stats {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  user-select: none;

  .card {
    width: 140px;
    display: flex;
    flex-direction: column;
    padding: 20px;
    border: 1px solid var(--el-border-color);
    border-radius: 12px;
    transition: border-color 0.2s;
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary);
    }

    .stat-value {
      font-size: 32px;
      color: var(--el-text-color-regular);
      font-weight: 600;
      line-height: normal;
      margin-bottom: 8px;
    }
    .stat-label {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

.section {
  margin-top: 20px;
  .section-header {
    line-height: normal;
    color: var(--el-text-color-regular);
    display: inline-block;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    position: relative;
    cursor: pointer;
    margin-bottom: 12px;
    padding-bottom: 6px;
    padding-left: 10px;
    transition:
      padding-left 0.3s ease,
      color 0.3s ease;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      height: 100%;
      width: 3px;
      background-color: var(--el-color-primary);
      border-radius: 4px;
      transition: height 0.3s ease;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 0;
      height: 3px;
      border-radius: 4px;
      background-color: var(--el-color-primary);
      transition: width 0.3s ease;
    }

    &:hover {
      padding-right: 10px;
      padding-left: 0;

      &::before {
        height: 0;
      }
      &::after {
        width: calc(100% - 10px);
      }
    }
  }
  .section-body {
    .empty {
      height: 140px;
      border: 1px dashed var(--el-border-color);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }

    ::v-deep(.plugin-card-simple) {
      background-color: transparent;
      &::before {
        background-color: transparent;
      }
    }
  }
}
</style>
