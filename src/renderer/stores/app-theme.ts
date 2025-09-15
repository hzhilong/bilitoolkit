import { logger } from '@/renderer/common/renderer-logger'
import type { AppThemeMode, AppThemeState } from 'bilitoolkit-api-types'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { AppConstants, defaultAppThemeState } from '@/shared/common/app-constants.ts'

// 默认备选的颜色
const DEFAULT_PRIMARY_COLORS = AppConstants.THEME.DEFAULT_PRIMARY_COLORS

/**
 * 应用主题状态 Store
 */
export const useAppThemeStore = defineStore(
  'AppThemeStore',
  () => {
    const state = reactive<AppThemeState>(defaultAppThemeState)

    //TODO 获取数据库配置
    //TODO 写入配置

    /**
     * 切换主题颜色
     */
    const switchThemeColor = () => {
      state.currPrimaryColorIndex = (state.currPrimaryColorIndex + 1) % DEFAULT_PRIMARY_COLORS.length
      const newColor = DEFAULT_PRIMARY_COLORS[state.currPrimaryColorIndex]
      logger.debug(`SwitchThemeColor`, state.currPrimaryColorIndex, newColor)
      return setPrimaryColor(newColor)
    }
    /**
     * 设置主题色
     * @param color
     */
    const setPrimaryColor = (color: string) => {
      state.primaryColor = color
      return state.primaryColor
    }
    /**
     * 设置主题模式
     * @param mode
     * @param isDark
     */
    const setThemeMode = (mode: AppThemeMode, isDark: boolean) => {
      state.themeMode = mode
      state.dark = isDark
      return state.themeMode
    }

    return { state, switchThemeColor, setPrimaryColor, setThemeMode }
  },
  {
    // 自己实现配置的持久化
    persist: false,
  },
)
