import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import type { ApiCallerContext, IpcToolkitUserApi } from '@/main/types/ipc-toolkit-api.ts'
import { type BaseWindowManager } from '@/main/window/base-window-manager.ts'
import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.ts'
import { _getGlobalData } from '@/main/api/handler/api-handler-global.ts'
import type { UserInfoWithCookie } from '@ybgnb/bili-api'
import { sleep } from '@ybgnb/utils'
import { setUserCookies, delUserCookies, getUserCookies } from '@/main/utils/session.ts'

/**
 * user API处理器
 */
export class UserApiHandler extends ApiHandleStrategy implements IpcToolkitUserApi {
  private windowManage: BaseWindowManager

  constructor(wm: BaseWindowManager) {
    super()
    this.windowManage = wm
  }

  async switchUser(context: ApiCallerContext, injectCookie?: boolean): Promise<UserInfoWithCookie> {
    const dialog = this.windowManage.showAppDialogView(context, 'switch_user')
    await sleep(15)
    const user = (await _getGlobalData(
      dialog.webContents,
      HOST_GLOBAL_DATA.SWITCH_USER,
      false,
      this.toApiCallerIdentity(context),
    )) as UserInfoWithCookie
    if (injectCookie) {
      await setUserCookies(context.webContents.session, user.userCookie.cookie)
    }
    return user
  }

  getCurrUserCookie(_context: ApiCallerContext): Promise<string[]> {
    return getUserCookies(_context.webContents.session)
  }

  async delCurrUserCookie(context: ApiCallerContext): Promise<void> {
    await delUserCookies(context.webContents.session)
  }
}
