import ffmpeg from 'fluent-ffmpeg'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function mergeAudioAndVideo(audioPath: string, videoPath: string, outputPath?: string): Promise<string> {
  const targetPath =
    outputPath ?? path.join(path.dirname(videoPath), `${path.parse(videoPath).name}.merge${path.parse(videoPath).ext}`)

  await new Promise<string | null>((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions(['-c:v copy', '-c:a copy', '-map 0:v:0', '-map 1:a:0', '-shortest'])
      .save(targetPath)
      .on('end', resolve)
      .on('error', reject)
  })

  // 覆盖原视频
  if (!outputPath) {
    await fs.unlink(videoPath)
    await fs.rename(targetPath, videoPath)
    return videoPath
  }

  return targetPath
}
