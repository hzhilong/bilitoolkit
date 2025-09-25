import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@/renderer/components/layout/MainLayout.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainLayout,
      redirect: '/home',
      children: [
        {
          name: '首页',
          path: '/home',
          component: () => import('../views/HomeView.vue'),
        },
        {
          name: '插件市场',
          path: '/market',
          component: () => import('../views/PluginMarket.vue'),
        },
        {
          name: '插件管理',
          path: '/manage',
          component: () => import('../views/PluginManage.vue'),
        },
        {
          name: '设置',
          path: '/settings',
          component: () => import('../views/SettingsView.vue'),
        },
        {
          name: '关于',
          path: '/about',
          component: () => import('../views/AboutView.vue'),
        },
      ],
    },
  ],
})
export default router
