import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import type { ApiCallerContext, IpcToolkitBiliApi } from '@/main/types/ipc-toolkit-api.js'
import { type BaseWindowManager } from '@/main/window/base-window-manager.js'
import type { BiliApiClientConfig, BiliApiMethod, ApiProxyContext } from 'bilitoolkit-types'
import { biliApiProxy } from '@/main/modules/bili-api-proxy.js'
import { type BizResult, execBiz } from '@ybgnb/utils'

/**
 * bili API处理器
 */
export class BiliApiHandler extends ApiHandleStrategy implements IpcToolkitBiliApi {
  private windowManage: BaseWindowManager

  constructor(wm: BaseWindowManager) {
    super()
    this.windowManage = wm
  }

  /**
   * 创建接口请求的客户端
   * @description 用于后续主线程发起bili接口请求（可操作多用户）
   */
  async createBiliClient(
    context: ApiCallerContext,
    config?: Partial<Omit<BiliApiClientConfig, 'id'>>,
  ): Promise<BiliApiClientConfig> {
    return biliApiProxy.create(config, context.envType !== 'host' ? context.plugin : undefined)
  }

  /**
   * 调用 bili-api 方法（由主线程发起请求，所以可以操作多用户）
   * @description 不可传入 signal 等非结构化的参数
   * @param context
   * @param apiProxyContext  api 代理上下文
   * @param apiInvokePath api调用路径（可传入服务方法 client.xxxService.xxx 或者基础请求方法 client.api.xxx，不包含'client.'，
   *  这里的类型只是方便自动提示，实际传入请使用库 bilitoolkit-runtime 的 createBiliApiProxy().xxx.xxx ）
   * @param args          api 方法参数
   * @example await api(null, c.user.getUserCards, 22)
   */
  async invokeBiliApi<AM extends BiliApiMethod>(
    context: ApiCallerContext,
    apiProxyContext: ApiProxyContext,
    apiInvokePath: AM,
    ...args: Parameters<AM>
  ): Promise<BizResult<Awaited<ReturnType<AM>>>> {
    return execBiz(async () => {
      return await biliApiProxy.invokeBiliApi(apiProxyContext, apiInvokePath, ...args)
    })
  }

  abortBiliApi(context: ApiCallerContext, abortSignalId: string): Promise<void> {
    return biliApiProxy.abortBiliApi(abortSignalId)
  }
}
