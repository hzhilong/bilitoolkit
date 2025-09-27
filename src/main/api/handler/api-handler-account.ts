import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { CommonError } from '@ybgnb/utils'
import type { ApiCallerContext, IpcToolkitAccountApi } from '@/main/types/ipc-toolkit-api.ts'
import { mainEnv } from '@/main/common/main-env.ts'
import type { BiliAccountInfo, BiliAccount } from 'bilitoolkit-api-types'
import type { BaseWindowManager } from '@/main/window/base-window-manager.ts'

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

    throw new CommonError('TODO')
  }

  async requestAccountAuth(context: ApiCallerContext, uid: number): Promise<BiliAccount> {
    console.log('============requestAccountAuth', uid)
    if (context.envType === 'host' && mainEnv.isProd()) throw new CommonError('插件环境才需要授权...')

    // TODO
    throw new CommonError('TODO')
  }
}
