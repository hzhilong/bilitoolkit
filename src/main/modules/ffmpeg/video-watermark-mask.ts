import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { nativeImage } from 'electron'
import { getFFmpegPath } from '@/main/modules/ffmpeg/init.js'

type FrameInfo = { width: number; height: number; durationSeconds?: number }
type PixelRegion = { x: number; y: number; width: number; height: number }

const extractRawRegion = (inputPath: string, at: number, region: PixelRegion): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const args = [
      '-hide_banner', '-loglevel', 'error', '-ss', String(at), '-i', inputPath,
      '-frames:v', '1', '-vf', `crop=${region.width}:${region.height}:${region.x}:${region.y}:exact=1`,
      '-pix_fmt', 'rgba', '-f', 'rawvideo', 'pipe:1',
    ]
    const child = spawn(getFFmpegPath(), args, { windowsHide: true })
    const chunks: Buffer[] = []
    let stderr = ''
    child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })
    child.on('error', reject)
    child.on('close', (code) => {
      const data = Buffer.concat(chunks)
      const expected = region.width * region.height * 4
      if (code === 0 && data.length === expected) resolve(data)
      else reject(new Error(stderr.trim() || `无法读取蒙版采样帧（${data.length}/${expected} 字节）`))
    })
  })

const dilate = (source: Uint8Array, width: number, height: number) => {
  const output = new Uint8Array(source.length)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let found = false
      for (let dy = -1; dy <= 1 && !found; dy += 1) {
        const yy = y + dy
        if (yy < 0 || yy >= height) continue
        for (let dx = -1; dx <= 1; dx += 1) {
          const xx = x + dx
          if (xx >= 0 && xx < width && source[yy * width + xx]) {
            found = true
            break
          }
        }
      }
      if (found) output[y * width + x] = 255
    }
  }
  return output
}

const erode = (source: Uint8Array, width: number, height: number) => {
  const output = new Uint8Array(source.length)
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let filled = true
      for (let dy = -1; dy <= 1 && filled; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!source[(y + dy) * width + x + dx]) {
            filled = false
            break
          }
        }
      }
      if (filled) output[y * width + x] = 255
    }
  }
  return output
}

export const createLightTextMask = async (
  inputPath: string,
  info: FrameInfo,
  region: PixelRegion,
  threshold: number,
  expansion: number,
  outputPath: string,
) => {
  const sampleCount = 12
  const duration = Math.max(1, info.durationSeconds ?? 1)
  const times = Array.from({ length: sampleCount }, (_, index) =>
    Math.max(0, Math.min(duration - 0.05, duration * (0.05 + (0.9 * index) / (sampleCount - 1)))),
  )
  const frames: Buffer[] = []
  // 顺序采样避免同时启动多个解码器，降低仅有 CPU 的设备在长视频上的瞬时负载。
  for (const time of times) frames.push(await extractRawRegion(inputPath, time, region))
  const pixels = region.width * region.height
  const detected = new Uint8Array(pixels)
  const brightness = new Array<number>(sampleCount)
  const chroma = new Array<number>(sampleCount)
  for (let pixel = 0; pixel < pixels; pixel += 1) {
    const offset = pixel * 4
    for (let sample = 0; sample < sampleCount; sample += 1) {
      const frame = frames[sample]
      const red = frame[offset]
      const green = frame[offset + 1]
      const blue = frame[offset + 2]
      brightness[sample] = Math.min(red, green, blue)
      chroma[sample] = Math.max(red, green, blue) - brightness[sample]
    }
    brightness.sort((a, b) => a - b)
    chroma.sort((a, b) => a - b)
    if (brightness[3] >= threshold && chroma[8] <= 85) detected[pixel] = 255
  }
  let precise = erode(dilate(detected, region.width, region.height), region.width, region.height)
  for (let index = 0; index < expansion; index += 1) {
    precise = dilate(precise, region.width, region.height)
  }
  const count = precise.reduce((total, value) => total + (value ? 1 : 0), 0)
  if (count < Math.max(12, pixels * 0.002)) {
    throw new Error('未检测到稳定的浅色水印笔画，请调低检测阈值或改用彩色/实心水印模式')
  }
  const bitmap = Buffer.alloc(info.width * info.height * 4, 0)
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) bitmap[(y * info.width + x) * 4 + 3] = 255
  }
  for (let y = 0; y < region.height; y += 1) {
    for (let x = 0; x < region.width; x += 1) {
      const value = precise[y * region.width + x]
      if (!value) continue
      const offset = ((region.y + y) * info.width + region.x + x) * 4
      bitmap[offset] = value
      bitmap[offset + 1] = value
      bitmap[offset + 2] = value
    }
  }
  const png = nativeImage.createFromBitmap(bitmap, { width: info.width, height: info.height, scaleFactor: 1 }).toPNG()
  await fs.writeFile(outputPath, png)
}
