import { createVNode, nextTick, render, type VNode } from 'vue'
import type { AccountAuthDialogProps, AccountAuthDialogExposed } from '@/renderer/components/dialog/types.ts'
import AccountAuthDialog from '@/renderer/components/dialog/AccountAuthDialog.vue'

let instance: VNode | undefined = undefined
let container: HTMLElement | null = null
let exposed: AccountAuthDialogExposed | undefined | null = undefined

/**
 * APP 全局账号授权的对话框
 */
export const AppAccountAuthDialog = {
  show(options: Omit<AccountAuthDialogProps, 'onCancel' | 'onConfirm'>): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!instance) {
        // 创建容器
        container = document.createElement('div')
        instance = createVNode(AccountAuthDialog, {
          modelValue: false,
          title: options.title,
          plugin: options.plugin,
          account: options.account,
          onConfirm: () => {},
        })
        render(instance, container)
        document.body.appendChild(container)
        await nextTick(() => {
          exposed = instance?.component?.exposed as AccountAuthDialogExposed
        })
      }

      exposed?.show({
        onConfirm: () => {
          resolve()
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
