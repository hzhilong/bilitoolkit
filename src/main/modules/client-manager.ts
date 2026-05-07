import { BiliClient, type ConsoleMethod } from '@ybgnb/bili-api'
import type { BiliApiClientConfig } from 'bilitoolkit-types'
import { generateId } from '@/main/utils/id.js'
import { omit } from 'lodash-es'
import { getLogLevel } from '@/shared/common/bili-api-log.js'
import { mainFileLogger } from '@/main/common/main-logger.js'

/**
 * 主进程代理的 bili-api Client 管理器
 */
class BiliClientManager {
  private clients = new Map<string, BiliClient>()

  get(id: string) {
    if (this.clients.has(id)) return this.clients.get(id)!

    throw new Error('未创建 BiliClient')
  }

  create(config?: Partial<Omit<BiliApiClientConfig, 'id'>>): BiliApiClientConfig {
    const client = new BiliClient({
      ...config,
      logLevel: getLogLevel(),
      logger: {
        debug: (...data: Parameters<ConsoleMethod>) => {
          mainFileLogger.debug(...data)
        },
        info: (...data: Parameters<ConsoleMethod>) => {
          mainFileLogger.info(...data)
        },
        error: (...data: Parameters<ConsoleMethod>) => {
          mainFileLogger.error(...data)
        },
      },
    })
    const id = generateId()
    this.clients.set(id, client)
    return {
      id: id,
      ...omit(client.config, 'logging', 'logLevel'),
      referer: client.config.referer as string,
    }
  }
}

export const biliClientManager = new BiliClientManager()
