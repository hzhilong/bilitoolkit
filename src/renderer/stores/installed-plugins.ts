import { toolkitApi } from '@/renderer/api/toolkit-api'
import { defaultAppInstalledPlugins } from '@/shared/common/app-constants'
import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { AppInstalledPlugins, InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { updatePluginIconCache, getPluginIconCache } from '@/renderer/services/plugin-icon-service.js'

/**
 * 应用已安装的插件
 */
export const useAppInstalledPlugins = defineStore(
  'biliToolkit-installed-plugins',
  () => {
    const state = reactive<AppInstalledPlugins>(defaultAppInstalledPlugins)

    const installedPlugins = computed<Array<InstalledToolkitPlugin>>(() => state.plugins)

    const init = async () => {
      Object.assign(state, await toolkitApi.core.getInstalledPlugins())
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

    const hasInstalled = (pluginId: string) => {
      return state.plugins.some((p) => p.id === pluginId)
    }

    return { init, state, installedPlugins, addPlugin, delPlugin, hasInstalled }
  },
  {
    // 自己实现配置的持久化
    persist: false,
  },
)
