import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { getPackage } from 'public-registry-api'
import { gt, valid } from 'semver'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin'
import { parseNpmPackage } from '@/shared/utils/plugin-parse'
import { useAppInstalledPlugins } from './installed-plugins'

export const usePluginUpdates = defineStore('plugin-updates', () => {
  const installed = useAppInstalledPlugins()
  const latest = reactive<Record<string, ToolkitPlugin>>({})
  const updating = reactive<Record<string, boolean>>({})
  const checking = ref(false)
  const failedChecks = ref(0)
  function recordLatest(plugin: ToolkitPlugin) {
    if (!valid(plugin.version)) return
    const previous = latest[plugin.id]
    if (!previous || !gt(previous.version, plugin.version)) latest[plugin.id] = plugin
  }
  function canUpdate(id: string) {
    const plugin = installed.find(id)
    const remote = latest[id]
    return !!plugin && !plugin.isTest && !!remote && !!valid(plugin.version) && gt(remote.version, plugin.version)
  }
  const available = computed(() => installed.state.plugins.filter((plugin) => canUpdate(plugin.id)))
  async function checkUpdates() {
    if (checking.value) return
    checking.value = true
    failedChecks.value = 0
    const queue = installed.state.plugins.filter((plugin) => !plugin.isTest)
    try {
      await Promise.all(
        Array.from({ length: Math.min(4, queue.length) }, async () => {
          for (let plugin = queue.shift(); plugin; plugin = queue.shift()) {
            try {
              recordLatest(parseNpmPackage(await getPackage(plugin.id)))
            } catch {
              failedChecks.value++
            }
          }
        }),
      )
    } finally {
      checking.value = false
    }
  }
  return { latest, updating, checking, failedChecks, available, canUpdate, recordLatest, checkUpdates }
})
