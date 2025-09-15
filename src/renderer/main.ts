import { createApp } from 'vue'
import { createPinia } from 'pinia'

import router from './router'
// 集成 ElementPlus
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
// 集成 remixicon
import 'remixicon/fonts/remixicon.css'
// 导入自己的样式
import '@/renderer/assets/scss/common/main.scss'
import App from '@/renderer/App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// 配置 ElementPlus
app.use(ElementPlus, { size: 'small', zIndex: 3000 })

app.mount('#app')
