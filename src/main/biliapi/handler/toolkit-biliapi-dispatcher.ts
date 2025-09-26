import { UserApiHandler } from '@/main/biliapi/handler/biliapi-handler-user.ts'
import { mainLogger } from '@/main/common/main-logger.ts'
import { ApiDispatcher, BiliApiHandleStrategy } from '@/main/types/api-dispatcher.ts'
import { CommonError } from '@ybgnb/utils'
import type { ToolkitBiliApi, BiliAccountId } from 'bilitoolkit-api-types'
import type { PluginApiInvokeOptions } from '@/shared/types/api-invoke.ts'
import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.ts'
import { accountManage } from '@/main/biliapi/common/bili-account.ts'

type IpcMainInvokeEvent = Electron.IpcMainInvokeEvent

/**
 * 判断是否需要注入账号上下文
 * @param obj
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBiliAccountId = (obj: any): obj is BiliAccountId => {
  if (!obj || typeof obj !== 'object') return false

  const keys = Object.keys(obj)
  return keys.length === 1 && keys[0] === 'uid' && typeof obj.uid === 'string'
}

/**
 * 哔哩API调度器
 */
export class BiliApiDispatcher extends ApiDispatcher<ToolkitBiliApi, BiliApiHandleStrategy> {
  constructor() {
    super()
    this.register('user', new UserApiHandler())
  }

  public async handle(event: IpcMainInvokeEvent, options: PluginApiInvokeOptions, _: ApiCallerContext) {
    const module = options.name.slice(0, options.name.indexOf('.')) as keyof ToolkitBiliApi
    const methodName = options.name.slice(module.length + 1)
    mainLogger.info(`调用 BiliApi：${module}.${methodName} `, JSON.stringify(options || ''))
    const strategy = this.strategies[module]
    if (!strategy) {
      throw new CommonError(`暂未支持 BiliApi 模块[${module}]`)
    }

    // 获取嵌套方法和执行上下文
    const nested = this.getNestedProperty(strategy, methodName)
    if (!nested || typeof nested.handler !== 'function') {
      throw new CommonError(`BiliApi 模块[${module}]不存在${methodName}方法`)
    }

    // 判断是否需要解析当前操作的账号并注入方法
    if (options.args !== undefined && options.args.length > 0 && options.args) {
      if (isBiliAccountId(options.args[0])) {
        options.args[0] = accountManage.getBiliAccount(options.args[0].uid)
      }
    }

    // 绑定正确上下文后执行
    const result = await nested.handler.bind(nested.parent)(...options.args)
    mainLogger.info(`BiliApi ${module}.${methodName} 执行成功`, JSON.stringify(result || ''))
    return result
  }
}
