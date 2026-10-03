<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import PluginList from '@/renderer/components/plugin/PluginList.vue'
import { ref, computed, watch, onMounted, onActivated } from 'vue'
import { useAppInstalledPlugins } from '@/renderer/stores/installed-plugins'
import { useStarredPluginsStore } from '@/renderer/stores/starred-plugins'
import PluginListSimple from '@/renderer/components/plugin/PluginListSimple.vue'
import type { InstalledToolkitPlugin, ToolkitPlugin, PluginType } from '@/shared/types/toolkit-plugin'
import { PluginUtils } from '@/renderer/utils/plugin-utils'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePluginUpdates } from '@/renderer/stores/plugin-updates'
import { showToast } from 'bilitoolkit-ui'
import { getErrorMessage } from '@ybgnb/utils'

const { state } = storeToRefs(useAppInstalledPlugins())
const { isStarred } = useStarredPluginsStore()
const route = useRoute()
const isShowStarred = ref(false)
const isDetailedView = ref(false)
const showType = ref<'' | PluginType>('')
const updates = usePluginUpdates()
const updatingAll = ref(false)
onMounted(() => updates.checkUpdates())
onActivated(() => updates.checkUpdates())

async function updateAllPlugins() {
  if (updatingAll.value) return
  updatingAll.value = true
  const plugins = [...updates.available]
  const failures: string[] = []
  let completed = 0
  try {
    for (const plugin of plugins) {
      try {
        await PluginUtils.update(plugin)
        completed++
      } catch (error) {
        failures.push(`${plugin.name}：${getErrorMessage(error)}`)
      }
    }
    showToast(
      failures.length ? `已更新 ${completed} 个插件；失败：${failures.join('；')}` : `已更新 ${completed} 个插件`,
    )
  } finally {
    updatingAll.value = false
  }
}

watch(
  () => [route.query.starred, route.query.type],
  ([starred, type]) => {
    isShowStarred.value = !!starred
    showType.value = (type as PluginType) || ''
  },
  {
    immediate: true,
  },
)

const renderPlugins = computed(() => {
  return state.value.plugins.filter((plugin) => {
    if (isShowStarred.value && !isStarred(plugin.id)) {
      return false
    }
    if (showType.value && plugin.type !== showType.value) {
      return false
    }
    return true
  })
})
const pluginCountDesc = computed(() => {
  return `已${isShowStarred.value ? '收藏' : '安装'}${renderPlugins.value.length}个插件`
})
const handleItemClick = (plugin: ToolkitPlugin) => {
  PluginUtils.openPluginView(plugin as InstalledToolkitPlugin)
}
</script>

<template>
  <PageContainer>
    <div class="header">
      <div class="installed-summary">
        <span>{{ pluginCountDesc }}</span>
        <el-button
          v-if="updates.available.length"
          size="small"
          type="primary"
          :loading="updatingAll"
          :disabled="Object.values(updates.updating).some(Boolean) && !updatingAll"
          @click="updateAllPlugins"
        >
          一键更新插件（{{ updates.available.length }}）
        </el-button>
        <el-button size="small" link :loading="updates.checking" :disabled="updatingAll" @click="updates.checkUpdates"
          >检查更新</el-button
        >
        <span v-if="updates.failedChecks" class="check-error">{{ updates.failedChecks }} 个插件检查失败，请重试</span>
      </div>
      <div class="actions">
        <el-radio-group v-model="isShowStarred" size="small">
          <el-radio-button label="全部" :value="false" />
          <el-radio-button label="已收藏" :value="true" />
        </el-radio-group>
        <el-radio-group v-model="isDetailedView" size="small">
          <el-radio-button label="简略视图" :value="false" />
          <el-radio-button label="详细视图" :value="true" />
        </el-radio-group>
        <el-radio-group v-model="showType" size="small">
          <el-radio-button label="全部" value="" />
          <el-radio-button label="ui 插件" value="ui" />
          <el-radio-button label="定时任务插件" value="task" />
        </el-radio-group>
      </div>
    </div>
    <div class="list-wrapper">
      <plugin-list v-if="isDetailedView" :plugins="renderPlugins" :type="'manage'" />
      <plugin-list-simple v-else :plugins="renderPlugins" @click="handleItemClick" />
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/plugin-manage';
</style>
