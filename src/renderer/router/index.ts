import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/renderer/components/layout/MainLayout.vue'
import { useAppTabStore } from '@/renderer/stores/app-tab.js'
import type { MenuItem } from '@/renderer/components/layout/AppMenus.vue'

export const homeMenus: Array<RouteRecordRaw & MenuItem> = [
  {
    icon: 'home',
    name: '主页',
    path: '/home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    name: '插件市场',
    icon: 'puzzle-2',
    path: '/market',
    component: () => import('../views/PluginMarket.vue'),
  },
  {
    name: '插件管理',
    icon: 'star',
    path: '/manage',
    component: () => import('../views/PluginManage.vue'),
  },
  {
    name: '最近使用',
    icon: 'history',
    path: '/recent',
    component: () => import('../views/RecentPlugins.vue'),
  },
  {
    name: '账号管理',
    icon: 'user-settings',
    path: '/userManage',
    component: () => import('../views/UserManage.vue'),
  },
  {
    name: '下载管理',
    icon: 'download',
    path: '/downloadManage',
    component: () => import('../views/DownloadManage.vue'),
  },
  {
    name: '任务管理',
    icon: 'task',
    path: '/taskManage',
    component: () => import('../views/task/TaskManageView.vue'),
  },
  {
    name: '设置',
    icon: 'settings-3',
    path: '/settings',
    component: () => import('../views/SettingsView.vue'),
  },
  {
    name: '关于',
    icon: 'information',
    path: '/about',
    component: () => import('../views/AboutView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainLayout,
      redirect: '/home',
      children: [
        ...homeMenus,
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
