import type { MenuItem } from '@/renderer/components/layout/AppMenus.vue'
import { toolkitApi } from '@/renderer/api/toolkit-api'
import { homeMenus } from '@/renderer/router/index'
import { showConfirm } from 'bilitoolkit-ui'

/**
 * 忽略当前菜单状态的路由路径前缀
 */
export const IGNORE_MENU_PATH_PREFIXES = ['/task-plugin', '/bili-space']

/**
 * 应用菜单
 */
export const buildAppMenus = () =>
  [
    ...homeMenus,
    {
      name: '退出',
      icon: 'shut-down',
      path: '/exit',
      beforeSwitch: async () => {
        try {
          await showConfirm('确认退出吗？')
        } catch {
          return false
        }
      },
      onclick: async () => {
        await toolkitApi.window.close()
      },
    },
  ] as MenuItem[]
