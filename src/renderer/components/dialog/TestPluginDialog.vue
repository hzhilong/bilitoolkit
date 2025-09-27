<template>
  <el-dialog
    v-model="visible"
    title="插件调试"
    width="380px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="true"
    @close="visible = false"
  >
    <div class="content-container">
      <el-input v-model="rootPath" style="width: 100%" placeholder="请输入开发环境的插件项目路径(已构建)" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="testPlugin">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { PluginUtils } from '@/renderer/utils/plugin-utils'
import { ref } from 'vue'
import { AppUtils } from 'bilitoolkit-ui'

const visible = defineModel<boolean>({ required: true })
const rootPath = ref('')

const testPlugin = () => {
  if (!rootPath.value) {
    AppUtils.showErrorMessage('目录不能为空')
    return
  }
  PluginUtils.testPlugin({
    rootPath: rootPath.value,
  })
  visible.value = false
}
</script>

<style scoped></style>
