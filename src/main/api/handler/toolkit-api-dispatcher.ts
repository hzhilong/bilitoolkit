import { ApiDispatcher } from '@/main/types/api-dispatcher.js'
import type { ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.js'
import { WindowApiHandler } from '@/main/api/handler/api-handler-window.js'
import type { PluginApiInvokeOptions } from '@/shared/types/api-invoke.js'
import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.js'
import { DBApiHandler } from '@/main/api/handler/api-handler-db.js'
import { FileApiHandler } from '@/main/api/handler/api-handler-file.js'
import { SystemApiHandler } from '@/main/api/handler/api-handler-system.js'
import { EventApiHandler } from '@/main/api/handler/api-handler-event.js'
import { GlobalApiHandler } from '@/main/api/handler/api-handler-global.js'
import { BiliApiHandler } from '@/main/api/handler/api-handler-bili.js'
import { CoreApiHandler } from '@/main/api/handler/api-handler-core.js'
import { BaseWindowManager } from '@/main/window/base-window-manager.js'
import { UserApiHandler } from '@/main/api/handler/api-handler-user.js'
import { TaskApiHandler } from '@/main/api/handler/api-handler-task.js'
import { HOST_API_MODULES } from '@/main/common/main-constants.js'
import { TimerApiHandler } from '@/main/api/handler/api-handler-timer.js'

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
    this.register('bili', new BiliApiHandler(wm))
    this.register('user', new UserApiHandler(wm))
    this.register('core', new CoreApiHandler())
    this.register('task', new TaskApiHandler())
    this.register('timer', new TimerApiHandler())
  }

  /**
   * 处理API
   * @param event IpcMainInvokeEvent
   * @param options 插件API调用选项
   * @param context 上下文
   */
  public async handle(event: IpcMainInvokeEvent | null, options: PluginApiInvokeOptions, context: ApiCallerContext) {
    if (!options) {
      throw new Error('缺少调用参数')
    }
    // 非宿主环境不允许调用核心API
    if (HOST_API_MODULES.includes(options.module) && context.envType !== 'host') {
      throw new Error('非法调用')
    }
    try {
      const strategy = this.strategies[options.module]
      if (!strategy) {
        throw new Error(`暂未支持API模块[${options.module}]`)
      }

      if (event && strategy instanceof ApiDispatcher) {
        // 嵌套调度器
        return await strategy.handle(event, options, context)
      }

      // 获取嵌套方法和执行上下文
      const nested = this.getNestedProperty(strategy, options.name)
      if (!nested || typeof nested.handler !== 'function') {
        throw new Error(`API模块[${options.module}]不存在${options.name}方法`)
      }

      // 绑定正确上下文后执行
      return await nested.handler.bind(nested.parent)(context, ...options.args)
    } catch (e: unknown) {
      throw e
    }
  }
}
