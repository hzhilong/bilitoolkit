import { createVNode, nextTick, render, type VNode } from 'vue'
import type { GlobalLoadingDialogProps, LoadingDialogExposed } from '@/renderer/components/dialog/loading-dialog/loading-dialog'
import LoadingDialog from '@/renderer/components/dialog/loading-dialog/LoadingDialog.vue'

let instance: VNode | undefined = undefined
let container: HTMLElement | null = null
let exposed: LoadingDialogExposed | undefined | null = undefined

/**
 * APP 全局加载框
 */
export const AppLoadingDialog = {
  /**
   * 显示，返回一个Promise，解析为是否成功，false为用户取消
   * @param options
   */
  show(options?: Omit<GlobalLoadingDialogProps, 'onCancel'>): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (!instance) {
        // 创建容器
        container = document.createElement('div')
        instance = createVNode(LoadingDialog, {
          modelValue: false,
        })
        render(instance, container)
        document.body.appendChild(container)
        await nextTick(() => {
          exposed = instance?.component?.exposed as LoadingDialogExposed
        })
      }

      // 自动关闭
      if (options?.autoCloseDelay) {
        setTimeout(() => {
          exposed?.hide()
          resolve(true)
        }, options?.autoCloseDelay)
      }

      exposed?.show({
        loadingText: options?.loadingText,
        canCancel: options?.canCancel,
        onCancel: () => {
          resolve(false)
        },
      })
    })
  },
  hide() {
    exposed?.hide()
  },
}
