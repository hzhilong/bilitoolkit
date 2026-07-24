import { BaseDownloader } from '@/main/modules/download/downloader/base-downloader.js'
import type { DownloaderContext } from '@/main/types/download.js'
import path from 'node:path'
import { ensureDir } from '@ybgnb/utils/node'
import fs from 'node:fs'
import { publicClient } from 'bilitoolkit-runtime/biliapi'
import { getErrorMessage, isCanceledError } from '@ybgnb/utils'
import { mainLogger } from '@/main/common/main-logger.js'

export class CommonDownloader extends BaseDownloader<'audio' | 'video' | 'cover' | 'subtitle'> {
  private url: string

  private lastCompletedBytes = 0
  private lastUpdateTime = 0

  private backupUrls: string[] = []
  private backupUrlIndex = 0

  constructor(context: DownloaderContext<'audio' | 'video' | 'cover' | 'subtitle'>) {
    super(context)

    switch (context.type) {
      case 'audio':
        this.url = context.source.audio.base_url
        this.backupUrls = context.source.audio.backupUrl || []
        break
      case 'video':
        this.url = context.source.video.base_url
        this.backupUrls = context.source.video.backupUrl || []
        break
      case 'cover':
        this.url = context.source.coverUrl
        break
      case 'subtitle':
        this.url = 'https:' + context.source.subtitleItem.subtitle_url
        break
    }
  }

  private getNextBackupUrl() {
    if (this.backupUrls.length === 0) return null
    const url = this.backupUrls[this.backupUrlIndex]
    if (url) {
      this.backupUrlIndex++
      return url
    }
    return null
  }

  /**
   * 开始下载
   */
  async download(): Promise<void> {
    try {
      this.updateStatus('downloading')
      this.abortController = new AbortController()
      await ensureDir(path.dirname(this.filePath))

      let completedBytes = 0
      // 检查本地已下载的文件大小
      if (fs.existsSync(this.filePath)) {
        const stat = fs.statSync(this.filePath)
        completedBytes = Math.min(stat.size, this.context.completedBytes ?? 0)
      }

      // 配置请求头，实现断点续传
      const headers: Record<string, string> = {
        'user-agent': publicClient.config.userAgent,
        origin: 'https://www.bilibili.com',
        cookie: this.context.userCookie.cookie,
        referer: 'https://www.bilibili.com',
      }
      headers['Range'] = `bytes=0-`

      const response = await fetch(this.url, {
        headers,
        signal: this.abortController.signal,
      })

      if (!response.ok && response.status !== 206) {
        mainLogger.error(`url [${this.url}] http 错误，状态码 ${response.status} ${response.statusText ?? ''}`)
        const nextBackupUrl = this.getNextBackupUrl()
        if (nextBackupUrl) {
          mainLogger.log(`尝试下一个备份 url：[${nextBackupUrl}]`)
          this.url = nextBackupUrl
          return await this.download()
        }

        throw new Error(`HTTP 错误! 状态码: ${response.status}`)
      }

      // 计算总字节数
      let totalBytes = 0
      //      const contentEncoding = response.headers.get('content-encoding')
      //      const isChunked = contentEncoding === 'gzip' || contentEncoding === 'deflate'

      if (response.status === 206) {
        // 服务器支持断点续传 (Partial Content)
        const contentRange = response.headers.get('content-range') // 格式通常为 bytes 100-200/1000
        if (contentRange) {
          const match = contentRange.match(/\/(\d+)/)
          totalBytes = match ? parseInt(match[1], 10) : 0
        } else {
          const contentLength = response.headers.get('content-length')
          totalBytes = contentLength ? parseInt(contentLength, 10) + completedBytes : 0
        }
      } else {
        // 服务器不支持断点续传（返回了 200），或者从头开始下载
        const contentLength = response.headers.get('content-length')
        totalBytes = contentLength ? parseInt(contentLength, 10) : 0
        completedBytes = 0 // 重置进度
      }

      // 根据服务器响应决定是追加写入还是覆盖写入
      // 如果服务器不支持 Range，则从头覆盖；支持则从 completedBytes 继续写
      const fileHandle = await fs.promises.open(
        this.filePath,
        response.status === 206 ? (completedBytes > 0 ? 'r+' : 'w+') : 'w',
      )

      if (!response.body) {
        await fileHandle.close()
        throw new Error('响应体为空，无法读取数据')
      }

      // 初始化进度计算器
      this.lastCompletedBytes = completedBytes
      this.lastUpdateTime = Date.now()

      const reader = response.body.getReader()

      let position = completedBytes

      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            this.updateStatus('completed')
            break
          }

          if (value) {
            const buffer = Buffer.from(value)

            // 严格写入指定位置
            await fileHandle.write(buffer, 0, buffer.length, position)

            position += buffer.length
            completedBytes += buffer.length

            // 触发进度回调
            this.triggerProgress(completedBytes, totalBytes)
          }
        }
      } finally {
        await fileHandle.close()
      }
    } catch (error: unknown) {
      if (!isCanceledError(error)) {
        this.updateStatus('failed', getErrorMessage(error))
      }
      throw error
    }
  }

  /**
   * 计算下载速度并触发回调
   */
  private triggerProgress(completedBytes: number, totalBytes: number) {
    const now = Date.now()
    const timeDiff = (now - this.lastUpdateTime) / 1000 // 秒

    // 节流：每 500ms 更新一次速度，避免过于频繁地触发计算
    if (timeDiff >= 0.5 || completedBytes === totalBytes) {
      const bytesDiff = completedBytes - this.lastCompletedBytes

      // 计算速度 (KBps)
      const speedKBps = timeDiff > 0 ? bytesDiff / 1024 / timeDiff : 0

      this.updateProgress({
        totalBytes,
        completedBytes,
        speedKBps: Math.round(speedKBps * 100) / 100, // 保留两位小数
      })

      this.lastCompletedBytes = completedBytes
      this.lastUpdateTime = now
    }
  }
}
