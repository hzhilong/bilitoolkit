import { BiliClient, type BiliClientConfig } from '@ybgnb/bili-api'
import type { BiliApiClientConfig, ApiProxyContext, BiliApiMethod } from 'bilitoolkit-types'
import { generateId } from '@/main/utils/id.js'
import { omit } from 'lodash-es'
import { getAppLogLevel } from '@/shared/common/app-log.js'
import { mainFileLogger, getPluginLogger } from '@/main/common/main-logger.js'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { dynamicCall } from '@ybgnb/utils'

class BiliApiProxy {
  private clients = new Map<string, BiliClient>()
  private abortMap = new Map<string, AbortController>()

  create(config?: Partial<Omit<BiliApiClientConfig, 'id'>>, plugin?: ToolkitPlugin): BiliApiClientConfig {
    const logger = plugin ? getPluginLogger(plugin.id) : mainFileLogger
    const client = new BiliClient({
      ...config,
      logLevel: getAppLogLevel(),
      logger: logger,
    })
    const id = generateId()
    this.clients.set(id, client)
    return {
      id: id,
      ...(omit(client.config, 'fetcher', 'logger', 'logLevel', 'referer') as Omit<
        BiliClientConfig,
        'fetcher' | 'logging' | 'logLevel' | 'referer'
      >),
      referer: client.config.referer as string,
    }
  }

  async invokeBiliApi<AM extends BiliApiMethod>(
    { clientId }: ApiProxyContext,
    apiInvokePath: AM,
    ...args: Parameters<AM>
  ): Promise<Awaited<ReturnType<AM>>> {
    if (!this.clients.has(clientId)) throw new Error('未创建 BiliClient')

    const client = this.clients.get(clientId)!

    let abortSignal = undefined
    let abortSignalId = undefined

    try {
      // 往 args 中注入中止信号
      if (args && args.length > 0) {
        const lastArg = args[args.length - 1]
        if (lastArg && typeof lastArg === 'object' && 'signal' in lastArg && typeof lastArg.signal === 'string') {
          // 被结构化的 signal: abortSignalId
          abortSignalId = lastArg.signal as string
          const abortController = new AbortController()
          abortSignal = abortController.signal
          lastArg.signal = abortSignal
          this.abortMap.set(abortSignalId, abortController)
        }
      }

      return await dynamicCall(client, apiInvokePath as unknown as string, ...args)
    } catch (error) {
      throw error
    } finally {
      if (abortSignalId) {
        this.abortMap.delete(abortSignalId)
      }
    }
  }

  async abortBiliApi(abortSignalId: string): Promise<void> {
    if (!this.abortMap.has(abortSignalId)) return
    this.abortMap.get(abortSignalId)!.abort()
    this.abortMap.delete(abortSignalId)
  }
}

export const biliApiProxy = new BiliApiProxy()
