import { mainLogger, getPluginLogger } from '@/main/common/main-logger.js'
import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import { showItemInFolder as _showItemInFolder } from '@/main/utils/file.js'
import { nativeTheme, shell } from 'electron'
import type { ApiCallerContext, IpcToolkitSystemApi } from '@/main/types/ipc-toolkit-api.js'
import { type AppLog, type AppThemeState, AppError } from 'bilitoolkit-types'
import { getAppThemeState } from '@/main/utils/host-app.js'
import { getAppLogLevel } from '@/shared/common/app-log.js'

/**
 * 系统相关API处理器
 */
export class SystemApiHandler extends ApiHandleStrategy implements IpcToolkitSystemApi {
  constructor() {
    super()
  }

  ping(_context: ApiCallerContext): Promise<boolean> {
    return Promise.resolve(true)
  }

  /**
   * 暂未适配该平台
   */
  notAdaptedCurrPlatform(): never {
    throw new AppError('内部错误，暂未适配该平台的System Api')
  }

  async browsePage(context: ApiCallerContext, path: string): Promise<void> {
    await shell.openExternal(path)
  }

  getLogLevel() {
    return Promise.resolve(getAppLogLevel())
  }

  async saveLog(context: ApiCallerContext, log: AppLog): Promise<void> {
    let logger
    if (context.envType === 'host') {
      logger = mainLogger
    } else {
      logger = getPluginLogger(context.plugin.id)
    }
    const args = log.data.map((d) => JSON.parse(d))
    if (args.length > 0) {
      logger[log.level](args[0], ...args.slice(1))
    }
  }

  async showItemInFolder(context: ApiCallerContext, path: string): Promise<void> {
    return _showItemInFolder(path)
  }

  async shouldUseDarkColors(_: ApiCallerContext): Promise<boolean> {
    return nativeTheme.shouldUseDarkColors
  }

  async getAppThemeState(_: ApiCallerContext): Promise<AppThemeState> {
    return Promise.resolve(getAppThemeState())
  }
}
