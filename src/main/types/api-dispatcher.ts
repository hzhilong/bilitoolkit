import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.ts'
import type { PluginApiInvokeOptions } from '@/shared/types/api-invoke.ts'
type IpcMainInvokeEvent = Electron.IpcMainInvokeEvent

/**
 * API 处理策略
 */
export class ApiHandleStrategy {}

/**
 * 哔哩API 处理策略
 */
export abstract class BiliApiHandleStrategy extends ApiHandleStrategy {}

/**
 * API调度器
 */
export abstract class ApiDispatcher<A, S extends ApiHandleStrategy = ApiHandleStrategy> {
  // 处理策略
  protected readonly strategies: Partial<Record<keyof A, S>> = {}

  /**
   * 注册策略
   * @private
   */
  protected register(module: keyof A, strategy: S) {
    this.strategies[module] = strategy
  }

  /**
   * 安全获取嵌套属性及上下文
   * @param obj
   * @param path
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected getNestedProperty(obj: any, path: string): { parent: any; handler: any } | null {
    const parts = path.split('.')
    let current = obj
    let parent = obj

    // 逐层遍历属性路径
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (!current || typeof current !== 'object' || !(part in current)) {
        return null // 路径中断立即返回
      }
      // 最后一层保留父级对象
      if (i < parts.length - 1) {
        parent = current
      }
      current = current[part]
    }

    return { parent, handler: current }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract handle(event: IpcMainInvokeEvent, options: PluginApiInvokeOptions, context: ApiCallerContext): Promise<any>
}
