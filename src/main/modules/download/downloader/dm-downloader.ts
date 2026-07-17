import { BaseDownloader } from '@/main/modules/download/downloader/base-downloader.js'
import type { DownloaderContext } from '@/main/types/download.js'
import { biliClients } from '@/main/modules/bili-api-client.js'
import { writeJSONFile } from '@ybgnb/utils/node'
import { isCanceledError, getErrorMessage } from '@ybgnb/utils'

export class DMDownloader extends BaseDownloader<'dm'> {
  constructor(context: DownloaderContext<'dm'>) {
    super(context)
  }

  async download(): Promise<void> {
    try {
      this.updateStatus('downloading')
      this.abortController = new AbortController()
      const client = biliClients.get(this.context.userCookie)
      const dmList = await client.dm.fetchAll(this.context.source.videoPart, { signal: this.abortController.signal })
      await writeJSONFile(this.context.absoluteFilePath, JSON.stringify(dmList, null, 2))
      this.updateStatus('completed')
    } catch (error) {
      if (!isCanceledError(error)) {
        this.updateStatus('failed', getErrorMessage(error))
      }
      throw error
    }
  }
}
