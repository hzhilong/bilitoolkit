import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@/renderer/components/layout/MainLayout.vue'
import { useAppTabStore } from '@/renderer/stores/app-tab.js'

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
          name: '最近使用',
          path: '/recent',
          component: () => import('../views/RecentPlugins.vue'),
        },
        {
          name: '账号管理',
          path: '/userManage',
          component: () => import('../views/UserManage.vue'),
        },
        {
          name: '任务管理',
          path: '/taskManage',
          component: () => import('../views/task/TaskManageView.vue'),
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
        {
          name: '任务插件',
          path: '/task-plugin',
          component: () => import('../views/task/TaskPluginView.vue'),
        },
        {
          name: 'bilibili',
          path: '/bili-space',
          component: () => import('../views/BiliView.vue'),
        },
      ],
    },
  ],
})
router.afterEach((to) => {
  // 将当前路由的完整路径加入 visitedViews
  useAppTabStore().addTab(to.fullPath)
})

export default router
