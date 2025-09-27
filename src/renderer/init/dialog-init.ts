// 对话框APP初始化监听器

import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.ts'
import type { BiliAccountInfo } from 'bilitoolkit-api-types'
import { execBiz, CommonError } from '@ybgnb/utils'
import { AppAccountSelectDialog } from '@/renderer/components/dialog/accountSelectService.ts'
import { cloneDeep, omit } from 'lodash'
import { toolkitApi } from '@/renderer/api/toolkit-api.ts'
import type { ApiCallerIdentity } from '@/shared/types/toolkit-core-api.ts'

export const initDialogAppListener = async () => {
  await window.toolkitApi.global.register(HOST_GLOBAL_DATA.CHOOSE_ACCOUNT, async (context: ApiCallerIdentity) => {
    if (context.envType === 'host') {
      throw new CommonError('非插件调用')
    }
    return execBiz<BiliAccountInfo>(async () => {
      try {
        const authAccount = await AppAccountSelectDialog.show({
          title: `【${context.plugin.name}】账号选择`,
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
