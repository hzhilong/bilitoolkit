import { toolkitApi } from '@/renderer/api/toolkit-api'
import { defaultAppInstalledPlugins } from '@/shared/common/app-constants'
import { cloneDeep } from 'lodash'
import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'
import { APP_DB_KEYS } from '@/shared/common/app-db.ts'
import { HOST_EVENT_CHANNELS } from '@/shared/types/host-event-channel.ts'
import type { AppInstalledPlugins, InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

/**
 * 应用已安装的插件
 */
export const useAppInstalledPlugins = defineStore(
  'BiliToolkit-AppInstalledPlugins',
  () => {
    const state = reactive<AppInstalledPlugins>(defaultAppInstalledPlugins)

    const init = async () => {
      // 获取数据库配置
      const dbConfig = (await window.toolkitApi.db.init(
        APP_DB_KEYS.APP_INSTALLED_PLUGINS,
        defaultAppInstalledPlugins,
      )) as AppInstalledPlugins
      Object.assign(state, dbConfig)
    }

    // 设置变化后更新数据库
    watch(
      () => state,
      (newVal) => {
        // 写入配置
        const data = cloneDeep(newVal)
        toolkitApi.db.write(APP_DB_KEYS.APP_INSTALLED_PLUGINS, data).then(async () => {
          await toolkitApi.event.emit(HOST_EVENT_CHANNELS.UPDATE_APP_INSTALLED_PLUGINS, data)
        })
      },
      { deep: true },
    )

    const addPlugin = (installedPlugin: InstalledToolkitPlugin) => {
      const old = state.plugins.findIndex((plugin) => plugin.id === installedPlugin.id)
      if (old > -1) {
        state.plugins.splice(old, 1, installedPlugin)
      }else{
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
