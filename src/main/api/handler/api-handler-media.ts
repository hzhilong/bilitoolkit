import { ApiHandleStrategy } from '@/main/types/api-dispatcher.js'
import type { ApiCallerContext, IpcToolkitMediaApi } from '@/main/types/ipc-toolkit-api.js'
import { videoWatermarkService } from '@/main/modules/ffmpeg/video-watermark.js'
import type { CreateVideoWatermarkJobOptions } from '@/shared/types/toolkit-media-api.js'

const getCallerKey = (context: ApiCallerContext) =>
  context.envType === 'host' ? 'host' : `${context.envType}:${context.plugin.id}`

export class MediaApiHandler extends ApiHandleStrategy implements IpcToolkitMediaApi {
  selectVideoFiles(context: ApiCallerContext) {
    return videoWatermarkService.selectVideoFiles(context.window, getCallerKey(context))
  }

  getVideoPreview(context: ApiCallerContext, filePath: string, positionSeconds?: number) {
    return videoWatermarkService.getVideoPreview(getCallerKey(context), filePath, positionSeconds)
  }

  createVideoWatermarkJobs(context: ApiCallerContext, options: CreateVideoWatermarkJobOptions) {
    return videoWatermarkService.createJobs(getCallerKey(context), options)
  }

  getVideoWatermarkJobs(context: ApiCallerContext, ids?: string[]) {
    return Promise.resolve(videoWatermarkService.getJobs(getCallerKey(context), ids))
  }

  cancelVideoWatermarkJob(context: ApiCallerContext, id: string) {
    videoWatermarkService.cancelJob(getCallerKey(context), id)
    return Promise.resolve()
  }
}
