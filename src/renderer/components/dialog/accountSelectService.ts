import AccountSelectDialog from '@/renderer/components/dialog/AccountSelectDialog.vue'
import { createVNode, nextTick, render, type VNode } from 'vue'
import type { BiliAccount } from 'bilitoolkit-api-types'
import type { AccountSelectDialogProps, AccountSelectDialogExposed } from '@/renderer/components/dialog/types.ts'

let instance: VNode | undefined = undefined
let container: HTMLElement | null = null
let exposed: AccountSelectDialogExposed | undefined | null = undefined

/**
 * APP 全局选择账号对话框
 */
export const AppAccountSelectDialog = {
  show(options: Omit<AccountSelectDialogProps, 'onSelected' | 'onCancel'>): Promise<BiliAccount> {
    return new Promise(async (resolve, reject) => {
      if (!instance) {
        // 创建容器
        container = document.createElement('div')
        instance = createVNode(AccountSelectDialog, {
          modelValue: false,
          title: '',
          onSelected: () => {},
        })
        render(instance, container)
        document.body.appendChild(container)
        await nextTick(() => {
          exposed = instance?.component?.exposed as AccountSelectDialogExposed
        })
      }

      exposed?.show({
        title: options.title,
        onSelected: (account: BiliAccount) => {
          resolve(account)
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
