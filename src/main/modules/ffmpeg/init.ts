/* eslint-disable @typescript-eslint/no-explicit-any */
import { app } from 'electron'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import path from 'path'
import { appPath } from '@/main/common/app-path.js'

const platformMap = {
  win32: 'ffmpeg.exe',
  darwin: 'ffmpeg',
  linux: 'ffmpeg',
}

export const initFFmpeg = () => {
  const exeName = (platformMap as any)[process.platform] ?? platformMap.win32
  const fullPath = app.isPackaged
    ? path.join(appPath.unpackedModulesPath, 'ffmpeg-static/', exeName)
    : (ffmpegStatic as unknown as string)
  ffmpeg.setFfmpegPath(fullPath)
}
