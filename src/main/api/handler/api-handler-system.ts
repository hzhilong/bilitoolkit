import { mainLogger } from '@/main/common/main-logger'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import { FileUtils } from '@/main/utils/file-utils'
import { CommonError } from '@ybgnb/utils'
import { nativeTheme, shell } from 'electron'
import type { ApiCallerContext, IpcToolkitSystemApi } from '@/main/types/ipc-toolkit-api.ts'
import type { AppLog, AppThemeState } from 'bilitoolkit-api-types'

/**
 * 系统相关API处理器
 */
export class SystemApiHandler extends ApiHandleStrategy implements IpcToolkitSystemApi {
  constructor() {
    super()
  }

  /**
   * 暂未适配该平台
   */
  notAdaptedCurrPlatform(): never {
    throw new CommonError('暂未适配该平台的System Api')
  }

  async browsePage(context: ApiCallerContext, path: string): Promise<void> {
    await shell.openExternal(path)
  }

  async saveLog(context: ApiCallerContext, appLog: AppLog): Promise<void> {
    if (appLog.args) {
      mainLogger[appLog.level](appLog.message, ...appLog.args)
    } else {
      mainLogger[appLog.level](appLog.message)
    }
  }

  async showItemInFolder(context: ApiCallerContext, path: string): Promise<void> {
    return FileUtils.showItemInFolder(path)
  }

  async shouldUseDarkColors(_: ApiCallerContext): Promise<boolean> {
    return nativeTheme.shouldUseDarkColors
  }

  async getAppThemeState(_: ApiCallerContext): Promise<AppThemeState> {
    // return (await getGlobalData(context, 'host', HOST_GLOBAL_DATA.APP_THEME_STATE)) as AppThemeState
    this.notAdaptedCurrPlatform()
  }
}
