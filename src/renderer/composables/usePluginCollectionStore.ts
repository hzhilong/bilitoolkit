import { storeToRefs } from 'pinia'
import { useAppInstalledPlugins } from '@/renderer/stores/installed-plugins'
import { ref, computed, watch } from 'vue'
import { toolkitApi } from '@/renderer/api/toolkit-api'
import { toIPC } from 'bilitoolkit-runtime'

export const usePluginCollectionStore = (dbName: string) => {
  const { state } = storeToRefs(useAppInstalledPlugins())
  const pluginIds = ref<string[]>([])
  const plugins = computed(() => {
    return pluginIds.value.map((id) => state.value.plugins.find((p) => p.id === id)).filter(Boolean)
  })

  const init = async () => {
    const dbData = await window.toolkitApi.db.init<string[]>(dbName, [])
    pluginIds.value.splice(0, plugins.value.length, ...(dbData ?? []))
  }

  // 设置变化后更新数据库
  watch(
    () => pluginIds.value,
    () => {
      toolkitApi.db.write(dbName, toIPC(pluginIds.value)).then()
    },
    { deep: true },
  )

  function add(pluginId: string) {
    remove(pluginId)
    pluginIds.value.unshift(pluginId)
    if (pluginIds.value.length > 20) {
      pluginIds.value.length = 20
    }
  }

  function remove(pluginId: string) {
    const index = pluginIds.value.indexOf(pluginId)
    if (index >= 0) {
      pluginIds.value.splice(index, 1)
    }
  }

  function clear() {
    pluginIds.value = []
  }

  function is(pluginId: string) {
    return pluginIds.value.indexOf(pluginId) > -1
  }

  return {
    init,
    plugins,
    add,
    remove,
    clear,
    is,
  }
}
