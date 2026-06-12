import { defineStore } from 'pinia'
import { APP_DB_KEYS } from '@/shared/common/app-db'
import { usePluginCollectionStore } from '@/renderer/composables/usePluginCollectionStore'

const dbName = APP_DB_KEYS.RECENT_PLUGINS

export const useRecentPluginsStore = defineStore(
  `biliToolkit-${dbName}`,
  () => {
    const { init, plugins, add, remove, clear } = usePluginCollectionStore(dbName)

    return {
      init,
      recentPlugins: plugins,
      addRecent: add,
      removeRecent: remove,
      clearRecent: clear,
    }
  },
  {
    persist: false,
  },
)
