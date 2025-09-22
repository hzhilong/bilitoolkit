import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

import router from './router'
import App from '@/renderer/App.vue'
import { logger } from '@/renderer/common/renderer-logger.ts'
import { useAppSettingsStore } from '@/renderer/stores/app-settings.ts'
import { useAppThemeStore } from '@/renderer/stores/app-theme.ts'
import DialogApp from '@/renderer/DialogApp.vue'
import { initHostDialogListener } from '@/renderer/api/dialog-init.ts'
import { initHostListener } from '@/renderer/api/host-init.ts'
import { AppUtils } from '@/renderer/utils/app-utils.ts'
import { initBilitoolkitUi } from 'bilitoolkit-ui'
import 'bilitoolkit-ui/style.css'

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

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedState)
  app.use(pinia)

  const ui = await initBilitoolkitUi(pinia)

  if (_windowApp?.type === 'dialogApp') {
    logger.log('对话框环境初始化')
    await initHostDialogListener()
  } else {
    logger.log('宿主环境初始化')
    await useAppSettingsStore().init()
    await useAppThemeStore().init()
    await initHostListener()
  }

  app.use(ui)
  app.use(router)
  // Vue 组件中发生的错误
  app.config.errorHandler = AppUtils.handleError
  // 捕捉那些没有被catch处理的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    AppUtils.handleError(event.reason)
    event.preventDefault() // 阻止默认控制台报错
  })
  app.mount('#app')
}

bootstrapApp()
  .then(() => {
    logger.info('App 启动成功')
  })
  .catch(AppUtils.handleError)
