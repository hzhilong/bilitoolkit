import { BiliClient, type ConsoleMethod, type BiliClientConfig } from '@ybgnb/bili-api'
import type { BiliApiClientConfig } from 'bilitoolkit-types'
import { generateId } from '@/main/utils/id.js'
import { omit } from 'lodash-es'
import { getLogLevel } from '@/shared/common/bili-api-log.js'
import { mainFileLogger, getPluginLogger } from '@/main/common/main-logger.js'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'

/**
 * 主进程代理的 bili-api Client 管理器
 */
class BiliClientManager {
  private clients = new Map<string, BiliClient>()

  get(id: string) {
    if (this.clients.has(id)) return this.clients.get(id)!

    throw new Error('未创建 BiliClient')
  }

  create(config?: Partial<Omit<BiliApiClientConfig, 'id'>>, plugin?: ToolkitPlugin): BiliApiClientConfig {
    const logger = plugin ? getPluginLogger(plugin.id) : mainFileLogger
    const client = new BiliClient({
      ...config,
      logLevel: getLogLevel(),
      logger: {
        debug: (...data: Parameters<ConsoleMethod>) => {
          logger.debug(...data)
        },
        info: (...data: Parameters<ConsoleMethod>) => {
          logger.info(...data)
        },
        error: (...data: Parameters<ConsoleMethod>) => {
          logger.error(...data)
        },
      },
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
}

export const biliClientManager = new BiliClientManager()
