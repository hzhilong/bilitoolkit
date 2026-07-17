import type { DownloadResourceType, DownloadTaskStatus } from 'bilitoolkit-types'
import type { DownloaderContext, DownloadProgress, DownloaderListener } from '@/main/types/download.js'
import fs from 'node:fs'

export abstract class BaseDownloader<Type extends DownloadResourceType> {
  protected abortController: AbortController | null = null
  protected readonly listener: DownloaderListener
  protected readonly filePath: string

  protected constructor(public context: DownloaderContext<Type>) {
    this.listener = context.listener
    this.filePath = context.absoluteFilePath
  }

  protected updateProgress(progress: DownloadProgress) {
    this.listener.onProgressUpdate(progress)
  }

  protected updateStatus(status: DownloadTaskStatus, error?: string) {
    this.listener.onStatusUpdate(status, error)
  }

  public abstract download(): Promise<void>

  /**
   * 等待下载
   */
  async pended(): Promise<void> {
    this.abortController?.abort()
    this.updateStatus('pending')
  }

  /**
   * 暂停下载
   */
  async pause(): Promise<void> {
    this.abortController?.abort()
    this.updateStatus('paused')
  }

  /**
   * 恢复下载
   */
  async resume(): Promise<void> {
    this.download().then()
  }

  /**
   * 取消下载（会删除未下载完的临时文件）
   */
  async cancel(): Promise<void> {
    this.abortController?.abort()
    this.updateStatus('canceled')

    // 删除不完整的本地文件
    if (fs.existsSync(this.filePath)) {
      try {
        fs.unlinkSync(this.filePath)
      } catch {
        // 忽略文件删除错误
      }
    }
  }
}
