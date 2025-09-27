import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { CommonError } from '@ybgnb/utils'
import type { ApiCallerContext, IpcToolkitAccountApi } from '@/main/types/ipc-toolkit-api.ts'
import type { BiliAccountInfo, BiliAccount } from 'bilitoolkit-api-types'
import type { BaseWindowManager } from '@/main/window/base-window-manager.ts'
import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.ts'
import { _getGlobalData } from '@/main/api/handler/api-handler-global.ts'

/**
 * 账号API处理器
 */
export class AccountApiHandler extends ApiHandleStrategy implements IpcToolkitAccountApi {
  private windowManage: BaseWindowManager

  constructor(wm: BaseWindowManager) {
    super()
    this.windowManage = wm
  }

  async chooseAccount(context: ApiCallerContext): Promise<BiliAccountInfo> {
    if (context.envType === 'host') throw new CommonError('插件环境才需要授权...')
    return new Promise((resolve, reject) => {
      const dialog = this.windowManage.showAppDialogView(context, 'account-select')
      setTimeout(async () => {
        await _getGlobalData(
          dialog.webContents,
          HOST_GLOBAL_DATA.CHOOSE_ACCOUNT,
          false,
          this.toApiCallerIdentity(context),
        )
          .then((account) => {
            resolve(account as BiliAccountInfo)
          })
          .catch((e) => {
            reject(e)
          })
      }, 10)
    })
  }

  async requestAccountAuth(context: ApiCallerContext, uid: number): Promise<BiliAccount> {
    if (context.envType === 'host') throw new CommonError('插件环境才需要授权...')
    return new Promise((resolve, reject) => {
      const dialog = this.windowManage.showAppDialogView(context, 'request-cookie-authorization')
      setTimeout(async () => {
        await _getGlobalData(
          dialog.webContents,
          HOST_GLOBAL_DATA.REQUEST_COOKIE_AUTHORIZATION,
          false,
          this.toApiCallerIdentity(context),
          uid
        )
          .then((account) => {
            resolve(account as BiliAccount)
          })
          .catch((e) => {
            reject(e)
          })
      }, 10)
    })
  }
}
