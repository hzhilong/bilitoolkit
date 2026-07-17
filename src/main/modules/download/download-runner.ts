import type { RunnerListener, RunnerContext, DownloaderContext, DownloadProgress } from '@/main/types/download.js'
import {
  type DownloadTask,
  type DownloadTaskStatus,
  type DownloadTaskProgress,
  type DownloadResourceType,
  type DownloadResource,
  type DownloadVideoPart,
} from 'bilitoolkit-types'
import type { BaseDownloader } from '@/main/modules/download/downloader/base-downloader.js'
import { DMDownloader } from '@/main/modules/download/downloader/dm-downloader.js'
import path from 'path'
import { CommonDownloader } from '@/main/modules/download/downloader/common-downloader.js'
import { isCanceledError, sleepRandom } from '@ybgnb/utils'
import { deleteFiles, ensureDir } from '@ybgnb/utils/node'
import { mergeAudioAndVideo } from '@/main/modules/ffmpeg/merge.js'
import { downloadRecordRepository } from '@/main/db/repository/download.js'
import fs from 'node:fs/promises'

type ItemIndex = number
type ItemResource = {
  absoluteFilePath: string
} & DownloadResource

export class DownloadRunner {
  private downloader: BaseDownloader<DownloadResourceType> | null = null
  private readonly listener: RunnerListener
  private readonly task: DownloadTask
  private readonly fileRoot: string
  private currentItem: number
  private readonly totalItem: number
  private items = new Map<ItemIndex, ItemResource>()

  constructor(private readonly context: RunnerContext) {
    const { task, listener, fileRoot } = context
    this.listener = listener
    this.task = task
    this.fileRoot = fileRoot
    this.currentItem = task.progress?.currentItem ?? 1
    this.totalItem = task.videos.reduce(
      (sum, video) => sum + video.parts.reduce((s, part) => s + part.resources.length, 0),
      0,
    )
    let index = 1
    for (const video of this.task.videos) {
      for (const part of video.parts) {
        for (const resource of part.resources) {
          this.items.set(index, {
            absoluteFilePath: this.buildAbsoluteFilePath(part, resource),
            ...resource,
          })
          index++
        }
      }
    }
  }

  private buildAbsoluteFilePath(part: DownloadVideoPart, resource: DownloadResource) {
    return path.join(...[this.fileRoot, part.subdirectory, resource.fullFilename].filter((s) => s != null))
  }

  public onStatusUpdate(status: DownloadTaskStatus, error?: string): void {
    if (status !== 'completed') {
      this.listener.onTaskUpdate(this.task.id, {
        status: status,
        error,
      })
    } else {
      this.handleItemCompleted(status).then()
    }
  }

  public onProgressUpdate({ totalBytes, completedBytes, speedKBps }: DownloadProgress): void {
    const progress: DownloadTaskProgress = {
      percent: Math.floor((completedBytes * 100) / totalBytes),
      currentItem: this.currentItem,
      totalBytes,
      completedBytes,
      speedKBps,
    }
    this.listener.onTaskUpdate(this.task.id, { progress: progress })
  }

  async buildDownloader(itemResource: ItemResource): Promise<BaseDownloader<DownloadResourceType>> {
    await ensureDir(path.dirname(itemResource.absoluteFilePath))
    const context = {
      ...itemResource,
      listener: this,
      userCookie: this.task.userCookie,
      completedBytes: (await downloadRecordRepository.getById(this.task.id))?.progress?.completedBytes,
    }
    if (context.type === 'dm') {
      return new DMDownloader({
        ...context,
        type: 'dm',
      })
    } else {
      return new CommonDownloader({
        ...context,
      } as DownloaderContext<'audio' | 'video' | 'cover' | 'subtitle'>)
    }
  }

  async download() {
    try {
      while (this.currentItem <= this.totalItem) {
        this.downloader = await this.buildDownloader(this.items.get(this.currentItem)!)
        await this.downloader.download()
        await sleepRandom(1111, 2222)
        this.currentItem++
      }
    } catch (error) {
      if (!isCanceledError(error)) {
        throw error
      }
    }
  }

  async pending() {
    if (this.downloader) {
      await this.downloader.pended()
    }
  }

  async pause() {
    if (this.downloader) {
      await this.downloader.pause()
    }
  }

  async resume() {
    if (this.downloader) {
      await this.downloader.resume()
    }
  }

  async cancel() {
    if (this.downloader) {
      await this.downloader.cancel()
    }
  }

  async deleteAllFile() {
    await deleteFiles(Array.from(this.items.values()).map(({ absoluteFilePath }) => absoluteFilePath))
  }

  private async handleItemCompleted(_status: DownloadTaskStatus) {
    if (this.currentItem >= this.totalItem) {
      if (this.task.settings?.autoMerge && this.totalItem > 1) {
        const mergePaths: [string, string][] = []
        for (const video of this.task.videos) {
          for (const part of video.parts) {
            const audio = part.resources.find((t) => t.type === 'audio')
            const video = part.resources.find((t) => t.type === 'video')

            if (audio != null && video != null) {
              mergePaths.push([this.buildAbsoluteFilePath(part, audio), this.buildAbsoluteFilePath(part, video)])
            }
          }
        }

        if (mergePaths.length > 0) {
          // 自动合并
          this.listener.onTaskUpdate(this.task.id, {
            status: 'merging',
          })
          for (const [audio, video] of mergePaths) {
            await mergeAudioAndVideo(audio, video)
          }
        }
      }

      let totalSize = 0

      for (const filePath of Array.from(this.items.values()).map(({ absoluteFilePath }) => absoluteFilePath)) {
        try {
          const stat = await fs.stat(filePath)
          if (stat.isFile()) {
            totalSize += stat.size
          }
        } catch {}
      }
      this.listener.onTaskUpdate(this.task.id, {
        status: 'completed',
        result: {
          totalBytes: totalSize,
        },
      })
    }
  }
}
