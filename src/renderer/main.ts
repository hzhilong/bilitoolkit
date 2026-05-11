import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

import router from './router/index.js'
import App from '@/renderer/App.vue'
import { logger } from '@/renderer/common/renderer-logger.js'
import { useAppSettingsStore } from '@/renderer/stores/app-settings.js'
import { useAppThemeStore } from '@/renderer/stores/app-theme.js'
import DialogApp from '@/renderer/DialogApp.vue'
import { initDialogAppListener } from '@/renderer/init/dialog-init.js'
import { initHostAppListener } from '@/renderer/init/host-init.js'
import { handleError, initBilitoolkitUi } from 'bilitoolkit-ui'
import 'bilitoolkit-ui/style.css'
import 'remixicon/fonts/remixicon.css'
import { useAppInstalledPlugins } from '@/renderer/stores/app-plugins.js'
import { usePluginStarsStore } from '@/renderer/stores/plugin-stars.js'
import { useUserStore } from '@/renderer/stores/user.js'
import { appEnv } from '@ybgnb/vite-env/common'
import { useRecommendedPlugins } from '@/renderer/stores/recommended-plugins'

async function bootstrapApp() {
  if (appEnv.DEV) {
    // 开发环境全量引入样式，禁用样式自动引入（应用会因为vite构建动态组件而频繁重启）
    import('element-plus/dist/index.css')
  }

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
    await useUserStore().init()
    await initDialogAppListener()
  } else {
    logger.log('宿主环境初始化')
    import('@/renderer/assets/scss/app/host-app.scss')
    await useAppSettingsStore().init()
    await useAppThemeStore().init()
    await useAppInstalledPlugins().init()
    await useRecommendedPlugins().init()
    await usePluginStarsStore().init()
    await useUserStore().init()
    await initHostAppListener()
  }

  app.use(ui)
  app.use(router)
  // Vue 组件中发生的错误
  app.config.errorHandler = handleError
  // 捕捉那些没有被catch处理的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason)
    event.preventDefault() // 阻止默认控制台报错
  })
  app.mount('#app')
}

bootstrapApp()
  .then(() => {
    logger.info('App 启动成功')
  })
  .catch(handleError)
