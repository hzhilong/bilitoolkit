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
// 导入自己的样式
import '@/renderer/assets/scss/app/host-app.scss'
import App from '@/renderer/App.vue'

const app = createApp(App)
// 挂载到全局属性
app.config.globalProperties.$toolkitApi = window.toolkitApi

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)
app.use(pinia)
app.use(router)
// 配置 ElementPlus
app.use(ElementPlus, { size: 'small', zIndex: 3000 })

app.mount('#app')
