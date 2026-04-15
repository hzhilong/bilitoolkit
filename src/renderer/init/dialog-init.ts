import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.ts'
import { CommonError, execBiz } from '@ybgnb/utils'
import { cloneDeep } from 'lodash'
import { toolkitApi } from '@/renderer/api/toolkit-api.ts'
import type { ApiCallerIdentity } from '@/shared/types/toolkit-core-api.ts'
import { AppUserAuthDialog } from '@/renderer/components/dialog/userAuthService.ts'
import type { UserInfo } from '@ybgnb/bili-api'
import { AppUserSelectDialog } from '@/renderer/components/dialog/userSelectService.ts'
import { appEnv } from '@/shared/common/app-env.ts'

/**
 * 对话框APP初始化监听器
 */
export const initDialogAppListener = async () => {
  await window.toolkitApi.global.register(HOST_GLOBAL_DATA.SWITCH_USER, async (context: ApiCallerIdentity) => {
    if (context.envType === 'host') {
      throw new CommonError('非插件调用')
    }
    return execBiz<UserInfo>(async () => {
      try {
        const authUser = await AppUserSelectDialog.show({
          title: `【${context.plugin.name}】账号选择`,
        })
        if (context.plugin.author === appEnv.env.APP_AUTHOR) {
          return cloneDeep(authUser)
        }
        await AppUserAuthDialog.show({
          plugin: context.plugin,
          user: authUser,
          title: `插件【${context.plugin.name}】请求授权`,
        })
        return cloneDeep(authUser)
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
