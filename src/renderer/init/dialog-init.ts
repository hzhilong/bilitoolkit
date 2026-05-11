import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.js'
import { execBiz } from '@ybgnb/utils'
import { toolkitApi } from '@/renderer/api/toolkit-api.js'
import type { ApiCallerIdentity } from '@/shared/types/toolkit-core-api.js'
import { AppUserAuthDialog } from '@/renderer/components/dialog/userAuthService.js'
import type { UserInfoWithCookie } from '@ybgnb/bili-api'
import { AppUserSelectDialog } from '@/renderer/components/dialog/userSelectService.js'
import { appEnv } from '@ybgnb/vite-env/common'
import { toIPC } from 'bilitoolkit-runtime'

/**
 * 对话框APP初始化监听器
 */
export const initDialogAppListener = async () => {
  await window.toolkitApi.global.register(HOST_GLOBAL_DATA.SWITCH_USER, async (context: ApiCallerIdentity) => {
    return execBiz<UserInfoWithCookie>(async () => {
      try {
        const title = context.envType === 'plugin' ? `【${context.plugin.name}】用户选择` : '请选择用户'
        const authUser = await AppUserSelectDialog.show({
          title: title,
        })
        if (context.envType === 'host' || context.plugin.author === appEnv.APP_AUTHOR) {
          return toIPC(authUser)
        }
        await AppUserAuthDialog.show({
          plugin: context.plugin,
          user: authUser,
          title: `插件【${context.plugin.name}】请求授权`,
        })
        return toIPC(authUser)
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
