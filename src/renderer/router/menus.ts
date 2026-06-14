import type { MenuItem } from '@/renderer/components/layout/AppMenus.vue'
import { toolkitApi } from '@/renderer/api/toolkit-api'

/**
 * 忽略当前菜单状态的路由路径前缀
 */
export const IGNORE_MENU_PATH_PREFIXES = ['/task-plugin', '/bili-space']

/**
 * 应用菜单
 */
export const appMenus: MenuItem[] = [
  {
    title: '主页',
    icon: 'home',
    path: '/home',
  },
  {
    title: '插件市场',
    icon: 'puzzle-2',
    path: '/market',
  },
  {
    title: '插件管理',
    icon: 'star',
    path: '/manage',
  },
  {
    title: '最近使用',
    icon: 'history',
    path: '/recent',
  },
  {
    title: '账号管理',
    icon: 'user-settings',
    path: '/userManage',
  },
  {
    title: '任务管理',
    icon: 'task',
    path: '/taskManage',
  },
  {
    title: '设置',
    icon: 'settings-3',
    path: '/settings',
  },
  {
    title: '关于',
    icon: 'information',
    path: '/about',
  },
  {
    title: '退出',
    icon: 'shut-down',
    path: '/exit',
    onclick: () => {
      toolkitApi.window.close().then()
    },
  },
]
