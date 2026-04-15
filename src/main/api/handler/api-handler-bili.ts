import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import type { ApiCallerContext, IpcToolkitBiliApi } from '@/main/types/ipc-toolkit-api.ts'
import { type BaseWindowManager } from '@/main/window/base-window-manager.ts'
import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.ts'
import { _getGlobalData } from '@/main/api/handler/api-handler-global.ts'
import type { UserInfo } from '@ybgnb/bili-api'

/**
 * bili API处理器
 */
export class BiliApiHandler extends ApiHandleStrategy implements IpcToolkitBiliApi {
  private windowManage: BaseWindowManager

  constructor(wm: BaseWindowManager) {
    super()
    this.windowManage = wm
  }

  switchUser(context: ApiCallerContext): Promise<UserInfo> {
    return new Promise((resolve, reject) => {
      const dialog = this.windowManage.showAppDialogView(context, 'switch_user')
      setTimeout(async () => {
        await _getGlobalData(dialog.webContents, HOST_GLOBAL_DATA.SWITCH_USER, false, this.toApiCallerIdentity(context))
          .then((user) => {
            resolve(user as UserInfo)
          })
          .catch((e) => {
            reject(e)
          })
      }, 10)
    })
  }
}
