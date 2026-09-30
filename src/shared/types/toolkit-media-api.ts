export type WatermarkRegion = {
  /** 相对于视频宽高的比例，范围 0-1 */
  x: number
  y: number
  width: number
  height: number
}

export type VideoMediaFile = {
  path: string
  name: string
  size: number
}

export type VideoPreview = {
  dataUrl: string
  width: number
  height: number
  durationSeconds?: number
}

export type VideoWatermarkJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'canceled'
export type VideoWatermarkMaskMode = 'light-text' | 'rectangle'

export type VideoWatermarkJob = {
  id: string
  inputPath: string
  outputPath?: string
  status: VideoWatermarkJobStatus
  progress: number
  error?: string
  createdAt: number
  updatedAt: number
}

export type CreateVideoWatermarkJobOptions = {
  inputPaths: string[]
  region: WatermarkRegion
  /** 浅色文字使用精细笔画蒙版，彩色或实心水印处理整个框选区域 */
  maskMode?: VideoWatermarkMaskMode
  /** 浅色文字检测阈值，0-255 */
  textThreshold?: number
  /** 浅色笔画向外扩展的像素数，0-6 */
  maskExpansion?: number
  keepOriginal?: boolean
  crf?: number
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow'
}

export interface ToolkitMediaApi {
  selectVideoFiles(): Promise<VideoMediaFile[]>
  getVideoPreview(filePath: string, positionSeconds?: number): Promise<VideoPreview>
  createVideoWatermarkJobs(options: CreateVideoWatermarkJobOptions): Promise<VideoWatermarkJob[]>
  getVideoWatermarkJobs(ids?: string[]): Promise<VideoWatermarkJob[]>
  cancelVideoWatermarkJob(id: string): Promise<void>
}
