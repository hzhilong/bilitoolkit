import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

import router from './router'
// 导入自定义的css变量
import '@/renderer/assets/scss/element/dark-var.css'
import '@/renderer/assets/scss/element/light-var.css'
// 集成 ElementPlus
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
// 集成 remixicon
import 'remixicon/fonts/remixicon.css'
import App from '@/renderer/App.vue'
import { logger } from '@/renderer/common/renderer-logger.ts'
import { useAppSettingsStore } from '@/renderer/stores/app-settings.ts'
import { useAppThemeStore } from '@/renderer/stores/app-theme.ts'
import { ThemeUtils } from '@/renderer/utils/theme-utils.ts'

async function bootstrapApp() {
  // TODO 根据app类型加载不同样式和组件
  const app = createApp(App)
  // 导入自己的样式
  import('@/renderer/assets/scss/app/host-app.scss')

  // 挂载到全局属性
  app.config.globalProperties.$toolkitApi = window.toolkitApi

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedState)
  app.use(pinia)
  app.use(ElementPlus, { size: 'small', zIndex: 3000 })

  logger.log('宿主环境初始化')
  await useAppSettingsStore().init()
  await useAppThemeStore().init()
  await ThemeUtils.initAppTheme()

  app.use(router)
  app.mount('#app')
}

bootstrapApp().then(() => {
  logger.info('App 启动成功')
})
