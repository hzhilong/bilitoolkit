import { BaseDownloader } from '@/main/modules/download/downloader/base-downloader.js'
import type { DownloaderContext } from '@/main/types/download.js'
import { biliClients } from '@/main/modules/bili-api-client.js'
import { writeJSONFile, getFileSize } from '@ybgnb/utils/node'
import { isCanceledError, getErrorMessage } from '@ybgnb/utils'
import type { Subtitle } from '@/main/types/video-subtitle.js'
import { writeFile } from 'node:fs/promises'

function formatSrtTime(seconds: number): string {
  const milliseconds = Math.round(seconds * 1000)

  const hours = Math.floor(milliseconds / 3_600_000)
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000)
  const secs = Math.floor((milliseconds % 60_000) / 1000)
  const ms = milliseconds % 1000

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

function toSrt(data: Subtitle): string {
  return data.body
    .map((item, index) => {
      return [index + 1, `${formatSrtTime(item.from)} --> ${formatSrtTime(item.to)}`, item.content].join('\n')
    })
    .join('\n\n')
}

export class SubtitleDownloader extends BaseDownloader<'subtitle'> {
  constructor(context: DownloaderContext<'subtitle'>) {
    super(context)
  }

  async download(): Promise<void> {
    try {
      let format = this.context.source.format
      const subtitleItem = this.context.source.subtitleItem
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
      const subtitleUrl = subtitleItem.subtitle_url.startsWith('http')
        ? subtitleItem.subtitle_url
        : `https:${subtitleItem.subtitle_url}`
      const subtitleData = (await (await fetch(subtitleUrl)).json()) as Subtitle

      if (format === 'json') {
        await writeJSONFile(this.context.absoluteFilePath, subtitleData)
      } else if (format === 'srt') {
        await writeFile(this.context.absoluteFilePath, toSrt(subtitleData))
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
}
