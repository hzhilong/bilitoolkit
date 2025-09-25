import { toolkitApi } from '@/renderer/api/toolkit-api'
import { cloneDeep } from 'lodash'
import { defineStore } from 'pinia'
import { reactive, watch, computed } from 'vue'
import { APP_DB_KEYS } from '@/shared/common/app-db.ts'
import { defaultPluginStars } from '@/shared/common/app-constants.ts'

/**
 * 收藏的插件
 */
export const usePluginStarsStore = defineStore(
  'PluginStarsStore',
  () => {
    const pluginStarIds = reactive<Set<string>>(new Set(defaultPluginStars))

    const init = async () => {
      // 获取数据库配置
      const dbConfig = (await window.toolkitApi.db.init(APP_DB_KEYS.PLUGIN_STARS, defaultPluginStars)) as string[]
      pluginStarIds.clear()
      for (const id of dbConfig) {
        pluginStarIds.add(id)
      }
    }

    // 设置变化后更新数据库
    watch(
      () => pluginStarIds,
      (newVal) => {
        // 写入配置
        toolkitApi.db.write(APP_DB_KEYS.PLUGIN_STARS, cloneDeep(Array.from(newVal))).then()
      },
      { deep: true },
    )

    const addStar = (id: string) => {
      pluginStarIds.add(id)
    }

    const delStar = (id: string) => {
      pluginStarIds.delete(id)
    }

    const hasStar = (id: string) => {
      return computed(() => {
        return pluginStarIds.has(id)
      })
    }

    return { init, pluginStarIds, addStar, delStar, hasStar }
  },
  {
    // 自己实现配置的持久化
    persist: false,
  },
)
