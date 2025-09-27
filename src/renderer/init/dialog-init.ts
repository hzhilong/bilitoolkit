// 对话框APP初始化监听器

import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.ts'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import type { BiliAccountInfo } from 'bilitoolkit-api-types'
import { execBiz } from '@ybgnb/utils'
import { AppAccountSelectDialog } from '@/renderer/components/dialog/accountSelectService.ts'
import { cloneDeep, omit } from 'lodash'
import { toolkitApi } from '@/renderer/api/toolkit-api.ts'

export const initDialogAppListener = async () => {
  await window.toolkitApi.global.register(HOST_GLOBAL_DATA.CHOOSE_ACCOUNT, async (plugin: ToolkitPlugin) => {
    return execBiz<BiliAccountInfo>(async (...args) => {
      console.log('==================', args)
      try {
        const authAccount = await AppAccountSelectDialog.show({
          title: `【${plugin.name}】账号选择`,
        })
        return cloneDeep(omit(authAccount, 'cookies', 'bili_jct'))
      } catch (e: unknown) {
        throw e
      } finally {
        if (window._windowApp?.type === 'dialogApp') {
          setTimeout(() => {
            // 等待动画完成
            toolkitApi.core.hideAppDialogWindow()
          }, 300)
        }
      }
    })
  })
}
