import { toolkitApi } from '@/renderer/api/toolkit-api'
import { cloneDeep } from 'lodash'
import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'
import type { AppSettings } from '@/shared/types/app-settings.ts'
import { defaultAppSettings } from '@/shared/common/app-constants.ts'
import { APP_DB_KEYS } from '@/shared/common/app-db.ts'

/**
 * 应用设置
 */
export const useAppSettingsStore = defineStore(
  'AppSettingsStore',
  () => {
    const appSettings = reactive<AppSettings>(defaultAppSettings)

    const init = async () => {
      // 获取数据库配置
      const dbConfig = (await window.toolkitApi.db.init(
        APP_DB_KEYS.APP_SETTINGS,
        defaultAppSettings,
      )) as AppSettings
      Object.assign(appSettings, dbConfig)
    }

    // 设置变化后更新数据库
    watch(
      () => appSettings,
      (newVal) => {
        // 写入配置
        toolkitApi.db.write(APP_DB_KEYS.APP_SETTINGS, cloneDeep(newVal)).then()
      },
      { deep: true },
    )

    return { init, appSettings }
  },
  {
    // 自己实现配置的持久化
    persist: false,
  },
)
