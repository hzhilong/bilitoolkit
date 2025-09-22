import type { MenuItem } from '@/renderer/components/layout/AppMenus.vue'

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
    title: '我的收藏',
    icon: 'star',
    path: '/settings2',
  },
  {
    title: '插件市场',
    icon: 'puzzle-2',
    path: '/market',
  },
  {
    title: '账号管理',
    icon: 'user-settings',
    path: '/accountManage',
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
    },
  },
]
