import { createVNode, nextTick, render, type VNode } from 'vue'
import UserAuthDialog from '@/renderer/components/dialog/UserAuthDialog.vue'
import type { UserAuthDialogExposed, UserAuthDialogProps } from '@/renderer/components/dialog/types.js'
import { createAbortError } from '@ybgnb/utils'

let instance: VNode | undefined = undefined
let container: HTMLElement | null = null
let exposed: UserAuthDialogExposed | undefined | null = undefined

/**
 * APP 全局账号授权的对话框
 */
export const AppUserAuthDialog = {
  show(options: Omit<UserAuthDialogProps, 'onCancel' | 'onConfirm'>): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!instance) {
        // 创建容器
        container = document.createElement('div')
        instance = createVNode(UserAuthDialog, {
          modelValue: false,
          title: options.title,
          plugin: options.plugin,
          user: options.user,
          onConfirm: () => {},
        })
        render(instance, container)
        document.body.appendChild(container)
        await nextTick(() => {
          exposed = instance?.component?.exposed as UserAuthDialogExposed
        })
      }

      exposed?.show({
        onConfirm: () => {
          resolve()
        },
        onCancel: () => {
          reject(createAbortError())
        },
      })
    })
  },
  hide() {
    exposed?.hide()
  },
}
