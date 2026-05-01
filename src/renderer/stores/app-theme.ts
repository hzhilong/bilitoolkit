import type { AppThemeState } from 'bilitoolkit-types'
import { cloneDeep } from 'lodash-es'
import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'
import { APP_DB_KEYS } from '@/shared/common/app-db.ts'
import { HOST_EVENT_CHANNELS } from '@/shared/types/host-event-channel.ts'
import { toolkitApi } from 'bilitoolkit-ui'
import { APP_THEME_STATE, defaultAppThemeState } from 'bilitoolkit-ui/common'

/**
 * 应用主题状态 Store
 */
export const useAppThemeStore = defineStore(
  'BiliToolkit-AppThemeStore',
  () => {
    const state = reactive<AppThemeState>(defaultAppThemeState)

    const init = async () => {
      // 获取数据库配置
      const dbConfig = (await window.toolkitApi.db.init(
        APP_DB_KEYS.APP_THEME_STATE,
        defaultAppThemeState,
      )) as AppThemeState
      Object.assign(state, dbConfig)
    }

    // 设置变化后更新数据库
    watch(
      () => state,
      (newVal) => {
        // 写入配置
        const data = cloneDeep(newVal)
        toolkitApi.db.write(APP_DB_KEYS.APP_THEME_STATE, data).then(async () => {
          await toolkitApi.event.emit(HOST_EVENT_CHANNELS.UPDATE_APP_THEME, data)
        })
      },
      { deep: true },
    )

    /**
     * 设置主题色
     * @param color
     */
    const setPrimaryColor = (color: string) => {
      state.primaryColor = color
      return state.primaryColor
    }

    /**
     * 切换主题颜色
     */
    const switchThemeColor = () => {
      state.primaryColorIndex = (state.primaryColorIndex + 1) % APP_THEME_STATE.primaryColors.length
      const newColor = APP_THEME_STATE.primaryColors[state.primaryColorIndex]
      return setPrimaryColor(newColor)
    }

    return { init, state, switchThemeColor, setPrimaryColor }
  },
  {
    // 自己实现配置的持久化
    persist: false,
  },
)
