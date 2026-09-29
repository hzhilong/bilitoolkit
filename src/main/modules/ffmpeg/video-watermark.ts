import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { dialog } from 'electron'
import { getFFmpegPath } from '@/main/modules/ffmpeg/init.js'
import { createLightTextMask } from '@/main/modules/ffmpeg/video-watermark-mask.js'
import { appPath } from '@/main/common/app-path.js'
import type {
  CreateVideoWatermarkJobOptions,
  VideoMediaFile,
  VideoPreview,
  VideoWatermarkJob,
  WatermarkRegion,
} from '@/shared/types/toolkit-media-api.js'

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mkv', '.mov', '.flv', '.avi', '.webm', '.m4v', '.ts'])

type VideoMetadata = {
  width: number
  height: number
  durationSeconds?: number
}

type InternalJob = VideoWatermarkJob & {
  ownerKey: string
  options: Omit<CreateVideoWatermarkJobOptions, 'inputPaths'>
}

const cloneJob = ({ ownerKey: _ownerKey, options: _options, ...job }: InternalJob): VideoWatermarkJob => ({ ...job })
const isCanceled = (job: InternalJob) => job.status === 'canceled'
const PRESETS = new Set(['ultrafast', 'fast', 'medium', 'slow'])
const MASK_MODES = new Set(['light-text', 'rectangle'])
const normalizePathKey = (filePath: string) => {
  const resolved = path.resolve(filePath)
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved
}

const assertVideoFile = async (filePath: string) => {
  if (!path.isAbsolute(filePath) || !VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase())) {
    throw new Error('请选择受支持的视频文件')
  }
  const stat = await fs.stat(filePath)
  if (!stat.isFile()) throw new Error('视频文件不存在')
}

const runFFmpeg = (args: string[], onStderr?: (text: string) => void): Promise<{ stdout: Buffer; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const process = spawn(getFFmpegPath(), args, { windowsHide: true })
    const stdout: Buffer[] = []
    let stderr = ''
    process.stdout.on('data', (chunk: Buffer) => stdout.push(chunk))
    process.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      stderr += text
      onStderr?.(text)
    })
    process.on('error', reject)
    process.on('close', (code) => {
      if (code === 0) resolve({ stdout: Buffer.concat(stdout), stderr })
      else reject(new Error(stderr.trim().split(/\r?\n/).slice(-8).join('\n') || `FFmpeg 退出码 ${code}`))
    })
  })
}

const readMetadata = async (filePath: string): Promise<VideoMetadata> => {
  let stderr = ''
  try {
    await runFFmpeg(['-hide_banner', '-i', filePath, '-frames:v', '1', '-f', 'null', '-'], (text) => {
      stderr += text
    })
  } catch (error) {
    // ffmpeg 在仅探测输入时可能返回非零退出码，仍从输出中读取媒体信息。
    if (!stderr) throw error
  }
  const videoLine = stderr.split(/\r?\n/).find((line) => /Video:/.test(line) && /\d{2,5}x\d{2,5}/.test(line))
  const sizeMatch = videoLine?.match(/(?:^|[\s,])(\d{2,5})x(\d{2,5})(?:[\s,]|$)/)
  if (!sizeMatch) throw new Error('无法读取视频分辨率')
  const durationMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/)
  const durationSeconds = durationMatch
    ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3])
    : undefined
  return { width: Number(sizeMatch[1]), height: Number(sizeMatch[2]), durationSeconds }
}

const normalizeRegion = (region: WatermarkRegion, metadata: VideoMetadata) => {
  const values = [region.x, region.y, region.width, region.height]
  if (values.some((value) => !Number.isFinite(value)) || region.width <= 0 || region.height <= 0) {
    throw new Error('水印区域无效')
  }
  const xRatio = Math.max(0, Math.min(1, region.x))
  const yRatio = Math.max(0, Math.min(1, region.y))
  const widthRatio = Math.max(0.001, Math.min(1 - xRatio, region.width))
  const heightRatio = Math.max(0.001, Math.min(1 - yRatio, region.height))
  const x = Math.min(metadata.width - 2, Math.max(0, Math.round(xRatio * metadata.width)))
  const y = Math.min(metadata.height - 2, Math.max(0, Math.round(yRatio * metadata.height)))
  const width = Math.max(2, Math.min(metadata.width - x, Math.round(widthRatio * metadata.width)))
  const height = Math.max(2, Math.min(metadata.height - y, Math.round(heightRatio * metadata.height)))
  return { x, y, width, height }
}

export class VideoWatermarkService {
  private readonly jobs = new Map<string, InternalJob>()
  private readonly authorizedFiles = new Map<string, Set<string>>()
  private readonly queue: string[] = []
  private runningJobId: string | null = null
  private runningProcess: ChildProcessWithoutNullStreams | null = null

  async selectVideoFiles(window: Electron.BrowserWindow, ownerKey: string): Promise<VideoMediaFile[]> {
    const result = await dialog.showOpenDialog(window, {
      title: '选择需要去水印的视频',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: '视频文件', extensions: Array.from(VIDEO_EXTENSIONS, (ext) => ext.slice(1)) }],
    })
    if (result.canceled) return []
    const authorized = this.authorizedFiles.get(ownerKey) ?? new Set<string>()
    result.filePaths.forEach((filePath) => authorized.add(normalizePathKey(filePath)))
    this.authorizedFiles.set(ownerKey, authorized)
    return await Promise.all(
      result.filePaths.map(async (filePath) => {
        const stat = await fs.stat(filePath)
        return { path: filePath, name: path.basename(filePath), size: stat.size }
      }),
    )
  }

  async getVideoPreview(ownerKey: string, filePath: string, positionSeconds = 1): Promise<VideoPreview> {
    this.assertAuthorized(ownerKey, filePath)
    await assertVideoFile(filePath)
    const metadata = await readMetadata(filePath)
    const lastFramePosition = metadata.durationSeconds ? Math.max(0, metadata.durationSeconds - 0.05) : positionSeconds
    const seek = Math.max(0, Math.min(positionSeconds, lastFramePosition))
    const { stdout } = await runFFmpeg([
      '-hide_banner',
      '-loglevel',
      'error',
      '-ss',
      String(seek),
      '-i',
      filePath,
      '-frames:v',
      '1',
      '-vf',
      'scale=1280:-2:force_original_aspect_ratio=decrease',
      '-f',
      'image2pipe',
      '-vcodec',
      'mjpeg',
      'pipe:1',
    ])
    if (!stdout.length) throw new Error('无法生成视频预览')
    return {
      dataUrl: `data:image/jpeg;base64,${stdout.toString('base64')}`,
      width: metadata.width,
      height: metadata.height,
      durationSeconds: metadata.durationSeconds,
    }
  }

  async createJobs(ownerKey: string, options: CreateVideoWatermarkJobOptions): Promise<VideoWatermarkJob[]> {
    if (!options || !Array.isArray(options.inputPaths) || !options.inputPaths.length) {
      throw new Error('请至少选择一个视频')
    }
    if (options.inputPaths.length > 100) throw new Error('单次最多处理 100 个视频')
    if (!options.region || typeof options.region !== 'object') throw new Error('水印区域无效')
    const maskMode = options.maskMode ?? 'light-text'
    if (!MASK_MODES.has(maskMode)) throw new Error('水印类型无效')
    const preset = options.preset ?? 'medium'
    if (!PRESETS.has(preset)) throw new Error('编码速度无效')
    for (const inputPath of options.inputPaths) {
      this.assertAuthorized(ownerKey, inputPath)
      await assertVideoFile(inputPath)
    }
    const created: InternalJob[] = []
    for (const inputPath of options.inputPaths) {
      const now = Date.now()
      const job: InternalJob = {
        id: randomUUID(),
        ownerKey,
        inputPath,
        status: 'queued',
        progress: 0,
        createdAt: now,
        updatedAt: now,
        options: {
          region: options.region,
          maskMode,
          textThreshold: Math.max(0, Math.min(255, options.textThreshold ?? 185)),
          maskExpansion: Math.max(0, Math.min(6, Math.round(options.maskExpansion ?? 2))),
          keepOriginal: options.keepOriginal ?? true,
          crf: Math.max(0, Math.min(51, options.crf ?? 18)),
          preset,
        },
      }
      this.jobs.set(job.id, job)
      this.queue.push(job.id)
      created.push(job)
    }
    void this.drainQueue()
    return created.map(cloneJob)
  }

  getJobs(ownerKey: string, ids?: string[]): VideoWatermarkJob[] {
    const jobs = ids
      ? ids
          .map((id) => this.jobs.get(id))
          .filter((job): job is InternalJob => job !== undefined && job.ownerKey === ownerKey)
      : Array.from(this.jobs.values()).filter((job) => job.ownerKey === ownerKey)
    return Array.from(jobs, cloneJob)
  }

  cancelJob(ownerKey: string, id: string) {
    const job = this.jobs.get(id)
    if (!job || job.ownerKey !== ownerKey || ['completed', 'failed', 'canceled'].includes(job.status)) return
    job.status = 'canceled'
    job.updatedAt = Date.now()
    const queueIndex = this.queue.indexOf(id)
    if (queueIndex >= 0) this.queue.splice(queueIndex, 1)
    if (this.runningJobId === id && this.runningProcess) {
      if (process.platform === 'win32' && this.runningProcess.pid) {
        spawn('taskkill', ['/pid', String(this.runningProcess.pid), '/T', '/F'], { windowsHide: true })
      } else {
        this.runningProcess.kill()
      }
    }
  }

  private async drainQueue() {
    if (this.runningJobId) return
    const id = this.queue.shift()
    if (!id) return
    const job = this.jobs.get(id)
    if (!job || job.status === 'canceled') {
      void this.drainQueue()
      return
    }
    this.runningJobId = id
    try {
      await this.processJob(job)
    } catch (error) {
      if (!isCanceled(job)) {
        job.status = 'failed'
        job.error = error instanceof Error ? error.message : String(error)
        job.updatedAt = Date.now()
      }
    } finally {
      this.runningProcess = null
      this.runningJobId = null
      void this.drainQueue()
    }
  }

  private async processJob(job: InternalJob) {
    job.status = 'running'
    job.updatedAt = Date.now()
    const metadata = await readMetadata(job.inputPath)
    if (isCanceled(job)) return
    const region = normalizeRegion(job.options.region, metadata)
    const parsed = path.parse(job.inputPath)
    const uniqueSuffix = `${Date.now()}-${job.id.slice(0, 8)}`
    const temporaryPath = path.join(parsed.dir, `.${parsed.name}.delogo-${uniqueSuffix}.mp4`)
    const desiredPath = path.join(parsed.dir, `${parsed.name}_delogo.mp4`)
    const outputPath = await this.getUniqueOutputPath(desiredPath)
    let maskPath: string | undefined
    try {
      let filter = `delogo=x=${region.x}:y=${region.y}:w=${region.width}:h=${region.height}:show=0`
      if ((job.options.maskMode ?? 'light-text') === 'light-text') {
        maskPath = path.join(appPath.temp, `video-watermark-mask-${job.id}.png`)
        await createLightTextMask(
          job.inputPath,
          metadata,
          region,
          job.options.textThreshold ?? 185,
          job.options.maskExpansion ?? 2,
          maskPath,
        )
        if (isCanceled(job)) return
        const escapedMaskPath = maskPath.replace(/\\/g, '/').replace(':', '\\:')
        filter = `removelogo=f='${escapedMaskPath}'`
      }
      await new Promise<void>((resolve, reject) => {
        const args = [
          '-hide_banner',
          '-y',
          '-i',
          job.inputPath,
          '-map',
          '0:v:0',
          '-map',
          '0:a?',
          '-vf',
          filter,
          '-c:v',
          'libx264',
          '-preset',
          job.options.preset ?? 'medium',
          '-crf',
          String(job.options.crf ?? 18),
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          '-movflags',
          '+faststart',
          temporaryPath,
        ]
        const child = spawn(getFFmpegPath(), args, { windowsHide: true })
        this.runningProcess = child
        let stderr = ''
        child.stderr.on('data', (chunk: Buffer) => {
          const text = chunk.toString()
          stderr += text
          const matches = Array.from(text.matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g))
          const match = matches.at(-1)
          if (match && metadata.durationSeconds) {
            const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
            job.progress = Math.max(job.progress, Math.min(99, Math.floor((seconds / metadata.durationSeconds) * 100)))
            job.updatedAt = Date.now()
          }
        })
        child.on('error', reject)
        child.on('close', (code) => {
          if (isCanceled(job)) reject(new Error('任务已取消'))
          else if (code === 0) resolve()
          else reject(new Error(stderr.trim().split(/\r?\n/).slice(-8).join('\n') || `FFmpeg 退出码 ${code}`))
        })
      })
    } catch (error) {
      await fs.rm(temporaryPath, { force: true })
      if (isCanceled(job)) return
      throw error
    } finally {
      if (maskPath) await fs.rm(maskPath, { force: true })
    }
    await fs.rename(temporaryPath, outputPath)
    if (!job.options.keepOriginal) await fs.rm(job.inputPath, { force: true })
    job.outputPath = outputPath
    job.progress = 100
    job.status = 'completed'
    job.updatedAt = Date.now()
  }

  private async getUniqueOutputPath(desiredPath: string) {
    const parsed = path.parse(desiredPath)
    let candidate = desiredPath
    let index = 1
    while (true) {
      try {
        await fs.access(candidate)
        candidate = path.join(parsed.dir, `${parsed.name} (${index++})${parsed.ext}`)
      } catch {
        return candidate
      }
    }
  }

  private assertAuthorized(ownerKey: string, filePath: string) {
    if (!this.authorizedFiles.get(ownerKey)?.has(normalizePathKey(filePath))) {
      throw new Error('请先通过文件选择窗口选择该视频')
    }
  }
}

export const videoWatermarkService = new VideoWatermarkService()

