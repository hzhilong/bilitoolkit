/* eslint-disable @typescript-eslint/no-explicit-any */
import { app } from 'electron'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import path from 'path'

const platformMap = {
  win32: 'win32/ffmpeg.exe',
  darwin: 'darwin/ffmpeg',
  linux: 'linux/ffmpeg',
}

export const initFFmpeg = () => {
  // 设置 ffmpeg 可执行文件路径
  const relativePath = (platformMap as any)[process.platform] ?? platformMap.win32
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, 'ffmpeg-static/bin', relativePath)
    : (ffmpegStatic as unknown as string)
  ffmpeg.setFfmpegPath(fullPath)
}
