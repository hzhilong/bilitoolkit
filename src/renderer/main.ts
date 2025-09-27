import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

import router from './router'
import App from '@/renderer/App.vue'
import { logger } from '@/renderer/common/renderer-logger.ts'
import { useAppSettingsStore } from '@/renderer/stores/app-settings.ts'
import { useAppThemeStore } from '@/renderer/stores/app-theme.ts'
import DialogApp from '@/renderer/DialogApp.vue'
import { initDialogAppListener } from '@/renderer/init/dialog-init.ts'
import { initHostAppListener } from '@/renderer/init/host-init.ts'
import { initBilitoolkitUi, AppUtils } from 'bilitoolkit-ui'
import 'bilitoolkit-ui/style.css'
import 'remixicon/fonts/remixicon.css'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.ts'
import { usePluginStarsStore } from '@/renderer/stores/plugin-stars.ts'
import { useBiliAccountStore } from '@/renderer/stores/bili-accounts.ts'

async function bootstrapApp() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any
  const _windowApp = window._windowApp

  // 根据app类型加载不同样式和组件
  if (_windowApp?.type === 'dialogApp') {
    logger.log('当前为对话框APP')
    app = createApp(DialogApp)
  } else {
    logger.log('当前为宿主环境APP')
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
    import('@/renderer/assets/scss/app/dialog-app.scss')
    await useAppThemeStore().init()
    await useBiliAccountStore().init()
    await initDialogAppListener()
  } else {
    logger.log('宿主环境初始化')
    import('@/renderer/assets/scss/app/host-app.scss')
    await useAppSettingsStore().init()
    await useAppThemeStore().init()
    await useAppInstalledPlugins().init()
    await usePluginStarsStore().init()
    await useBiliAccountStore().init()
    await initHostAppListener()
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
