import { toolkitApi } from '@/renderer/api/toolkit-api'
import { logger } from '@/renderer/common/renderer-logger'
import { BaseUtils } from '@ybgnb/utils';
import type { AppLog, LogLevel } from 'bilitoolkit-api-types';
import { ElMessage, ElMessageBox, type ElMessageBoxOptions, type MessageParams } from 'element-plus'
import { defaultsDeep } from 'lodash'

/**
 * App工具，包含一些全局的方法
 */
export class AppUtils {
  static saveLog(level: LogLevel = 'info', message: string, ...args: unknown[]): Promise<void> {
    let appLog: AppLog
    if (!args) {
      appLog = { level, message }
    } else {
      appLog = {
        level,
        message,
        args: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)),
      }
    }
    return toolkitApi.system.saveLog(appLog)
  }

  /**
   * 统一处理异常
   * @param error
   */
  static handleError(error: unknown): void {
    if (!error) {
      logger.error('[app]:未知错误')
    } else if (error instanceof Error) {
      logger.error('[app]:出现错误', error)
      AppUtils.saveLog('error', '[app]:未知错误', error.message, error.stack).then()
    } else {
      logger.error('[app]:出现错误', error)
      AppUtils.saveLog('error', '[app]:未知错误', error).then()
      // 待完善
      AppUtils.message({
        message: BaseUtils.getErrorMessage(error),
        type: 'error',
      })
    }
  }

  static message(message: string): void
  static message({
    message,
    type,
    duration,
  }: {
    message: string
    type?: 'success' | 'warning' | 'info' | 'error'
    duration?: number
  }): void

  static message(
    config:
      | string
      | {
          message: string
          type?: 'success' | 'warning' | 'info' | 'error'
          duration?: number
        },
  ): void {
    const options: MessageParams = {
      message: '',
      type: 'success',
      duration: 3000,
    }
    if (typeof config === 'string') {
      options.message = config
    } else {
      Object.assign(options, config)
    }
    ElMessage(options)
  }

  static showInfoMessage(msg: string): void {
    AppUtils.message({
      message: msg,
      type: 'info',
    })
  }

  static showErrorMessage(msg: string): void {
    AppUtils.message({
      message: msg,
      type: 'error',
    })
  }

  static confirm(message: string, title: string = '提示', options: ElMessageBoxOptions = {}) {
    return new Promise<void>((resolve, reject) => {
      ElMessageBox.confirm(
        message,
        title,
        defaultsDeep(options, {
          autofocus: false,
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          type: 'warning',
        }),
      )
        .then(() => {
          resolve()
        })
        .catch(() => {
          reject()
        })
    })
  }
}
