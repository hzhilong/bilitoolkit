import { defineStore } from 'pinia'
import { APP_DB_KEYS } from '@/shared/common/app-db.js'
import { usePluginCollectionStore } from '@/renderer/composables/usePluginCollectionStore'

const dbName = APP_DB_KEYS.STARRED_PLUGINS

export const useStarredPluginsStore = defineStore(
  `biliToolkit-${dbName}`,
  () => {
    const { init, plugins, add, remove, is } = usePluginCollectionStore(dbName)

    return {
      init,
      starredPlugins: plugins,
      addStar: add,
      removeStar: remove,
      isStarred: is,
    }
  },
  {
    persist: false,
  },
)
