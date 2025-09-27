import { mainLogger } from '@/main/common/main-logger'
import { ApiDispatcher } from '@/main/types/api-dispatcher'
import { BaseUtils, CommonError } from '@ybgnb/utils'
import type { ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.ts'
import { WindowApiHandler } from '@/main/api/handler/api-handler-window.ts'
import type { PluginApiInvokeOptions } from '@/shared/types/api-invoke.ts'
import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.ts'
import { DBApiHandler } from '@/main/api/handler/api-handler-db.ts'
import { FileApiHandler } from '@/main/api/handler/api-handler-file.ts'
import { SystemApiHandler } from '@/main/api/handler/api-handler-system.ts'
import { EventApiHandler } from '@/main/api/handler/api-handler-event.ts'
import { GlobalApiHandler } from '@/main/api/handler/api-handler-global.ts'
import { AccountApiHandler } from '@/main/api/handler/api-handler-account.ts'
import { CoreApiHandler } from '@/main/api/handler/api-handler-core.ts'
import { BaseWindowManager } from '@/main/window/base-window-manager.ts'
import { BiliApiDispatcher } from '@/main/biliapi/handler/toolkit-biliapi-dispatcher.ts'

type IpcMainInvokeEvent = Electron.IpcMainInvokeEvent

/**
 * 哔哩工具姬API调度器
 */
export class ToolkitApiDispatcher extends ApiDispatcher<ToolkitApiWithCore> {
  private windowManage: BaseWindowManager

  constructor(wm: BaseWindowManager) {
    super()
    this.windowManage = wm
    this.register('window', new WindowApiHandler(wm))
    this.register('db', new DBApiHandler())
    this.register('file', new FileApiHandler())
    this.register('system', new SystemApiHandler())
    this.register('event', new EventApiHandler())
    this.register('global', new GlobalApiHandler(wm))
    this.register('account', new AccountApiHandler(wm))
    this.register('core', new CoreApiHandler())
    this.register('bili', new BiliApiDispatcher())
  }

  /**
   * 处理API
   * @param event IpcMainInvokeEvent
   * @param options 插件API调用选项
   * @param context 上下文
   */
  public async handle(event: IpcMainInvokeEvent, options: PluginApiInvokeOptions, context: ApiCallerContext) {
    mainLogger.info(`=========================================================`)
    mainLogger.info(`调用API：`, JSON.stringify(options))
    if (!options) {
      throw new CommonError('API调用失败：缺少调用参数')
    }
    // 非宿主环境不允许调用核心API
    if (options.module === 'core' && context.envType !== 'host') {
      throw new CommonError('API调用失败：非法调用')
    }
    try {
      const strategy = this.strategies[options.module]
      if (!strategy) {
        throw new CommonError(`暂未支持API模块[${options.module}]`)
      }

      if (strategy instanceof ApiDispatcher) {
        // 嵌套调度器
        return await strategy.handle(event, options, context)
      }

      // 获取嵌套方法和执行上下文
      const nested = this.getNestedProperty(strategy, options.name)
      if (!nested || typeof nested.handler !== 'function') {
        throw new CommonError(`API模块[${options.module}]不存在${options.name}方法`)
      }

      // 绑定正确上下文后执行
      mainLogger.info(`API【${options.module}.${options.name}】执行中...`)
      const result = await nested.handler.bind(nested.parent)(context, ...options.args)
      if (this.printResult(options)) {
        mainLogger.info(`API【${options.module}.${options.name}】执行成功  ${result ? JSON.stringify(result) : ''}\n`)
      } else {
        mainLogger.info(`API【${options.module}.${options.name}】执行成功 \n`)
      }
      return result
    } catch (e: unknown) {
      mainLogger.error(e)
      mainLogger.error(`API ${options.module}.${options.name} 调用失败：${BaseUtils.getErrorMessage(e)}\n`)
      throw BaseUtils.convertToCommonError(e, 'API调用失败：')
    }
  }

  private printResult(options: PluginApiInvokeOptions) {
    return ![`core.getPluginIcon`].includes(`${options.module}.${options.name}`)
  }
}
