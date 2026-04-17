import { ApiHandleStrategy } from '@/main/types/api-dispatcher'
import type { ApiCallerContext, IpcToolkitBiliApi } from '@/main/types/ipc-toolkit-api.ts'
import { type BaseWindowManager } from '@/main/window/base-window-manager.ts'
import type { BiliApiClientConfig, BiliApiMethod } from 'bilitoolkit-api-types'

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
  createBiliClient(_context: ApiCallerContext, _config?: Partial<BiliApiClientConfig>): Promise<BiliApiClientConfig> {
    throw new Error()
  }

  /**
   * 调用 bili-api 方法（由主线程发起请求，所以可以操作多用户）
   * @param context
   * @param clientConfig  由createBiliClient创建的客户端配置
   * @param apiInvokePath api调用路径（可传入服务方法 client.xxxService.xxx 或者基础请求方法 client.api.xxx，不包含'client.'，
   *  这里的类型只是方便自动提示，实际传入请使用库 bilitoolkit-api-runtime 的 createBiliApiProxy().xxx.xxx ）
   * @param args          api 方法参数
   * @example await api(null, c.user.getUserCards, 22)
   */
  invokeBiliApi<AM extends BiliApiMethod>(
    _context: ApiCallerContext,
    _clientConfig: BiliApiClientConfig,
    _apiInvokePath: AM,
    ..._args: Parameters<AM>
  ): ReturnType<AM> {
    throw new Error()
  }
}
