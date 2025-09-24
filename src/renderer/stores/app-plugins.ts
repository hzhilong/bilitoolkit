import { toolkitApi } from '@/renderer/api/toolkit-api'
import { defaultAppInstalledPlugins } from '@/shared/common/app-constants'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { AppInstalledPlugins, InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

/**
 * 应用已安装的插件
 */
export const useAppInstalledPlugins = defineStore(
  'BiliToolkit-AppInstalledPlugins',
  () => {
    const state = reactive<AppInstalledPlugins>(defaultAppInstalledPlugins)

    const init = async () => {
      Object.assign(state, await toolkitApi.core.getAppInstalledPlugins())
    }

    const addPlugin = (installedPlugin: InstalledToolkitPlugin) => {
      const old = state.plugins.findIndex((plugin) => plugin.id === installedPlugin.id)
      if (old > -1) {
        state.plugins.splice(old, 1, installedPlugin)
      } else {
        state.plugins.push(installedPlugin)
      }
    }

    return { init, state, addPlugin }
  },
  {
    // 自己实现配置的持久化
    persist: false,
  },
)
