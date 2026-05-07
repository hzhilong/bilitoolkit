import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import type { ApiCallerContext, IpcToolkitUserApi } from '@/main/types/ipc-toolkit-api.js'
import { type BaseWindowManager } from '@/main/window/base-window-manager.js'
import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.js'
import { _getGlobalData } from '@/main/api/handler/api-handler-global.js'
import type { UserInfoWithCookie, UserCookie } from '@ybgnb/bili-api'
import { sleep } from '@ybgnb/utils'
import { setUserCookies, delUserCookies, getUserCookies } from '@/main/utils/session.js'
import { userService } from '@/main/service/user.service.js'

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

  async switchCurrUser(context: ApiCallerContext, user: UserInfoWithCookie): Promise<void> {
    await setUserCookies(context.webContents.session, user.userCookie.cookie)
  }
  async getMyInfoByCookie(context: ApiCallerContext, userCookie: UserCookie): Promise<UserInfoWithCookie> {
    return userService.getMyInfoByCookie(userCookie)
  }
}
