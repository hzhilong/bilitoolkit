import { toolkitApi } from '@/renderer/api/toolkit-api'
import { defaultAppInstalledPlugins } from '@/shared/common/app-constants'
import { defineStore } from 'pinia'
import { reactive, computed, type Reactive, toRef } from 'vue'
import type { AppInstalledPlugins, InstalledToolkitPlugin, ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { updatePluginIconCache, getPluginIconCache } from '@/renderer/services/plugin-icon-service.ts'

/**
 * 应用已安装的插件
 */
export const useAppInstalledPlugins = defineStore(
  'BiliToolkit-AppInstalledPlugins',
  () => {
    const state = reactive<AppInstalledPlugins>(defaultAppInstalledPlugins)

    const init = async () => {
      Object.assign(state, await toolkitApi.core.getAppInstalledPlugins())
      for (const plugin of state.plugins) {
        getPluginIconCache(plugin).then()
      }
    }

    const addPlugin = (installedPlugin: InstalledToolkitPlugin) => {
      const old = state.plugins.findIndex((plugin) => plugin.id === installedPlugin.id)
      if (old > -1) {
        state.plugins.splice(old, 1, installedPlugin)
      } else {
        state.plugins.push(installedPlugin)
      }
      updatePluginIconCache(installedPlugin).then()
    }

    const delPlugin = (installedPlugin: InstalledToolkitPlugin) => {
      const old = state.plugins.findIndex((plugin) => plugin.id === installedPlugin.id)
      if (old > -1) {
        state.plugins.splice(old, 1)
      }
    }

    const hasInstalled = (plugin: Reactive<ToolkitPlugin>) => {
      const idRef = toRef(plugin, 'id')
      return computed(() => state.plugins.some((p) => p.id === idRef.value))
    }

    return { init, state, addPlugin, delPlugin, hasInstalled }
  },
  {
    // 自己实现配置的持久化
    persist: false,
  },
)
