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
import DialogApp from '@/renderer/DialogApp.vue'
import { initHostDialogListener } from '@/renderer/api/dialog-init.ts'
import { initHostListener } from '@/renderer/api/host-init.ts'
import { AppUtils } from '@/renderer/utils/app-utils.ts'

async function bootstrapApp() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any
  const _windowApp = window._windowApp

  // 根据app类型加载不同样式和组件
  if (_windowApp?.type === 'dialogApp') {
    logger.log('当前为对话框APP')
    import('@/renderer/assets/scss/app/dialog-app.scss')
    app = createApp(DialogApp)
  } else {
    logger.log('当前为宿主环境APP')
    import('@/renderer/assets/scss/app/host-app.scss')
    app = createApp(App)
  }

  // 挂载到全局属性
  app.config.globalProperties.$toolkitApi = window.toolkitApi

  app.use(ElementPlus, { size: 'small', zIndex: 3000 })

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedState)
  app.use(pinia)

  if (_windowApp?.type === 'dialogApp') {
    logger.log('对话框环境初始化')
    await ThemeUtils.updateCssVar(await window.toolkitApi.system.getAppThemeState())
    await initHostDialogListener()
  } else {
    logger.log('宿主环境初始化')
    await useAppSettingsStore().init()
    await useAppThemeStore().init()
    await ThemeUtils.initAppTheme()
    await initHostListener()
  }

  app.use(router)
  // Vue 组件中发生的错误
  app.config.errorHandler = AppUtils.handleError
  // 捕捉那些没有被catch处理的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    AppUtils.handleError(event.reason)
  })
  app.mount('#app')
}

bootstrapApp()
  .then(() => {
    logger.info('App 启动成功')
  })
  .catch(AppUtils.handleError)
