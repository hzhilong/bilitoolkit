import { createWriteStream } from 'fs'
import { get } from 'https'
import { mainLogger } from '@/main/common/main-logger.ts'
import type { GithubRepository } from '@/shared/utils/github-parse.ts'

export class GithubUtils {
  static downloadFromGithubRaw({ owner, repo, branch }: GithubRepository, repoFilePath: string, saveTo: string) {
    mainLogger.debug('downloadFromGithubRaw', { owner, repo, branch }, repoFilePath, saveTo)
    return new Promise<void>((resolvePromise, rejectPromise) => {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${repoFilePath}`
      const fileStream = createWriteStream(saveTo)

      get(url, (res) => {
        if (res.statusCode !== 200) {
          rejectPromise(new Error(`Failed to download file. Status: ${res.statusCode}`))
          return
        }

        res.pipe(fileStream)
        fileStream.on('finish', () => {
          fileStream.close()
          resolvePromise()
        })
      }).on('error', (err) => {
        rejectPromise(err)
      })
    })
  }
}
