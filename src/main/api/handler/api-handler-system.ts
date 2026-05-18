import { mainLogger, getPluginLogger } from '@/main/common/main-logger.js'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import { FileUtils } from '@/main/utils/file.js'
import { nativeTheme, shell } from 'electron'
import type { ApiCallerContext, IpcToolkitSystemApi } from '@/main/types/ipc-toolkit-api.js'
import type { AppLog, AppThemeState } from 'bilitoolkit-types'
import { getAppThemeState } from '@/main/utils/host-app.js'

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
    throw new Error('暂未适配该平台的System Api')
  }

  async browsePage(context: ApiCallerContext, path: string): Promise<void> {
    await shell.openExternal(path)
  }

  async saveLog(context: ApiCallerContext, appLog: AppLog): Promise<void> {
    let logger
    if (context.envType === 'host') {
      logger = mainLogger
    } else {
      logger = getPluginLogger(context.plugin.id)
    }
    if (appLog.args) {
      logger[appLog.level](appLog.message, ...appLog.args)
    } else {
      logger[appLog.level](appLog.message)
    }
  }

  async showItemInFolder(context: ApiCallerContext, path: string): Promise<void> {
    return FileUtils.showItemInFolder(path)
  }

  async shouldUseDarkColors(_: ApiCallerContext): Promise<boolean> {
    return nativeTheme.shouldUseDarkColors
  }

  async getAppThemeState(_: ApiCallerContext): Promise<AppThemeState> {
    return Promise.resolve(getAppThemeState())
  }
}
