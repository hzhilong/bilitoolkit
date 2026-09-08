import { BaseDownloader } from '@/main/modules/download/downloader/base-downloader.js'
import type { DownloaderContext } from '@/main/types/download.js'
import { biliClients } from '@/main/modules/bili-api-client.js'
import { writeJSONFile } from '@ybgnb/utils/node'
import { isCanceledError, getErrorMessage } from '@ybgnb/utils'
import { getFileSize } from '@ybgnb/utils/node'
import type { DanmakuElem } from '@ybgnb/bili-api'
import { XMLBuilder } from 'fast-xml-parser'
import { writeFile } from 'node:fs/promises'

export class DMDownloader extends BaseDownloader<'dm'> {
  constructor(context: DownloaderContext<'dm'>) {
    super(context)
  }

  async download(): Promise<void> {
    try {
      let {
        source: { format },
      } = this.context
      if (format == null) {
        format = 'json'
      }

      this.updateStatus('downloading')
      this.updateProgress({
        totalBytes: 0,
        completedBytes: 0,
        speedKBps: 0,
      })
      this.abortController = new AbortController()
      const client = biliClients.get(this.context.userCookie)
      const dmList = await client.dm.fetchAll(this.context.source.videoPart, { signal: this.abortController.signal })

      if (format === 'json') {
        await writeJSONFile(this.context.absoluteFilePath, dmList)
      } else if (format === 'xml') {
        await this.writeXml(dmList)
      }

      const fileSize = await getFileSize(this.context.absoluteFilePath)
      this.updateProgress({
        totalBytes: fileSize,
        completedBytes: fileSize,
        speedKBps: fileSize / 1024,
      })
      this.updateStatus('completed')
    } catch (error) {
      if (!isCanceledError(error)) {
        this.updateStatus('failed', getErrorMessage(error))
      }
      throw error
    }
  }

  async writeXml(dmList: DanmakuElem[]) {
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      indentBy: '    ',
    })

    const {
      video: { title },
      cid,
      part: { part, page },
      bvid,
    } = this.context

    const dArray = dmList.map((item) => {
      const attrs: (string | number)[] = [
        item.progress / 1000,
        item.mode,
        item.fontsize,
        item.color,
        `${item.ctime}`,
        item.pool,
        item.midHash,
        item.idStr,
        item.weight,
      ]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dObj: any = {
        '@_p': attrs.join(','),
        '#text': item.content,
      }
      return dObj
    })

    const xmlObj = {
      i: {
        chatserver: 'chat.bilibili.com',
        bvid: bvid,
        title: title,
        chatid: `${cid}`,
        part: part,
        page: page,
        mission: '0',
        maxlimit: `${dmList.length}`,
        state: '0',
        real_name: '0',
        source: 'e-r',
        d: dArray,
      },
    }

    const xmlContent = builder.build(xmlObj)
    await writeFile(this.context.absoluteFilePath, new TextEncoder().encode(xmlContent), 'utf8')
  }
}
