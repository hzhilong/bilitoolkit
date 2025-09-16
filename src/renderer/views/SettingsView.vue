<script setup lang="ts">
import { toolkitApi } from '@/renderer/api/toolkit-api'
import SettingGroup from '@/renderer/components/settings/SettingGroup.vue'
import SettingItem from '@/renderer/components/settings/SettingItem.vue'
import UpdateThemeColorButton from '@/renderer/components/settings/UpdateThemeColorButton.vue'
import UpdateThemeModeButton from '@/renderer/components/settings/UpdateThemeModeButton.vue'
import { BaseUtils } from '@ybgnb/utils'
import { type Ref, ref } from 'vue'
import { useAppSettingsStore } from '@/renderer/stores/app-settings.ts'
import { DevToolsType } from '@/shared/types/app-settings.ts'
import PageContainer from '@/renderer/components/layout/PageContainer.vue'

const appSettings = useAppSettingsStore().appSettings

const logsDesc = ref('总大小：正在获取...')
const dbsDesc = ref('总大小：正在获取...')
const filesDesc = ref('总大小：正在获取...')
const initSettingDesc = (desc: Ref<string>, init: () => Promise<string>) => {
  init()
    .then((folderSize) => {
      desc.value = `总大小：${folderSize}`
    })
    .catch((error) => {
      desc.value = `总大小：获取失败，${BaseUtils.getErrorMessage(error)}`
    })
}
// initSettingDesc(logsDesc, toolkitApi.core.getLogsFolderSize)
// initSettingDesc(dbsDesc, toolkitApi.core.getDBsFolderSize)
// initSettingDesc(filesDesc, toolkitApi.core.getFilesFolderSize)

</script>

<template>
  <PageContainer class="page-container">
    <div class="settings">
      <SettingGroup name="应用设置">
        <SettingItem title="主题颜色">
          <UpdateThemeColorButton />
        </SettingItem>
        <SettingItem title="主题模式">
          <UpdateThemeModeButton />
        </SettingItem>
        <SettingItem title="软件日志" :desc="logsDesc">
          <el-button type="primary" @click="toolkitApi.core.openLogsFolder()">打开</el-button>
        </SettingItem>
        <SettingItem title="数据库" :desc="dbsDesc">
          <el-button type="primary" @click="toolkitApi.core.openDBsFolder()">打开</el-button>
        </SettingItem>
        <SettingItem title="保存的文件" :desc="filesDesc">
          <el-button type="primary" @click="toolkitApi.core.openFilesFolder()">打开</el-button>
        </SettingItem>
      </SettingGroup>
      <SettingGroup name="开发者">
        <SettingItem title="开发者工具调试对象" desc="Ctrl+Shift+i 启动开发者工具">
          <el-select v-model="appSettings.devToolsType" style="width: 100px">
            <el-option v-for="item in Object.values(DevToolsType)" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </SettingItem>
      </SettingGroup>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/pages/settings';
</style>
