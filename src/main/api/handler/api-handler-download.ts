import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import type { ApiCallerContext, IpcToolkitDownloadApi } from '@/main/types/ipc-toolkit-api.js'
import type { DownloadTask, DownloadTaskFilters, DownloadCreateOptions } from 'bilitoolkit-types'
import type { PageParams, PageResult } from 'bilitoolkit-ui'
import { downloadManager } from '@/main/modules/download/download-manager.js'

/**
 * 下载 API 处理器
 */
export class DownloadApiHandler extends ApiHandleStrategy implements IpcToolkitDownloadApi {
  create(context: ApiCallerContext, options: DownloadCreateOptions): Promise<DownloadTask> {
    return downloadManager.create(context, options)
  }

  get(context: ApiCallerContext, id: number): Promise<DownloadTask | null> {
    return downloadManager.get(context, id)
  }

  cancel(context: ApiCallerContext, id: number): Promise<void> {
    return downloadManager.cancel(context, id)
  }

  pause(context: ApiCallerContext, id: number): Promise<void> {
    return downloadManager.pause(context, id)
  }

  pauseAll(context: ApiCallerContext): Promise<void> {
    return downloadManager.pauseAll(context)
  }

  resume(context: ApiCallerContext, id: number): Promise<void> {
    return downloadManager.resume(context, id)
  }

  resumeAll(context: ApiCallerContext): Promise<void> {
    return downloadManager.resumeAll(context)
  }

  remove(
    context: ApiCallerContext,
    id: number,
    options?: {
      deleteFiles?: boolean
    },
  ): Promise<void> {
    return downloadManager.remove(context, id, options)
  }

  fetchPage(
    context: ApiCallerContext,
    pageParams: PageParams,
    filter: DownloadTaskFilters,
  ): Promise<PageResult<DownloadTask>> {
    return downloadManager.fetchPage(context, pageParams, filter)
  }

  openFolder(context: ApiCallerContext, id: number, videoIndex: number, partIndex: number): Promise<void> {
    return downloadManager.openFolder(context, id, videoIndex, partIndex)
  }
}
