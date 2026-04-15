import { createVNode, nextTick, render, type VNode } from 'vue'
import type { UserSelectDialogExposed, UserSelectDialogProps } from '@/renderer/components/dialog/types.ts'
import type { UserInfo } from '@ybgnb/bili-api'
import UserSelectDialog from '@/renderer/components/dialog/UserSelectDialog.vue'

let instance: VNode | undefined = undefined
let container: HTMLElement | null = null
let exposed: UserSelectDialogExposed | undefined | null = undefined

/**
 * APP 全局选择账号对话框
 */
export const AppUserSelectDialog = {
  show(options: Omit<UserSelectDialogProps, 'onSelected' | 'onCancel'>): Promise<UserInfo> {
    return new Promise(async (resolve, reject) => {
      if (!instance) {
        // 创建容器
        container = document.createElement('div')
        instance = createVNode(UserSelectDialog, {
          modelValue: false,
          title: '',
          onSelected: () => {},
        })
        render(instance, container)
        document.body.appendChild(container)
        await nextTick(() => {
          exposed = instance?.component?.exposed as UserSelectDialogExposed
        })
      }

      exposed?.show({
        title: options.title,
        onSelected: (user: UserInfo) => {
          resolve(user)
        },
        onCancel: () => {
          reject('用户已取消')
        },
      })
    })
  },
  hide() {
    exposed?.hide()
  },
}
