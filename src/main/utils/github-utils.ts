// main/downloadFile.ts
import { createWriteStream } from 'fs'
import { get } from 'https'
import { CommonError } from '@ybgnb/utils'
import { mainLogger } from '@/main/common/main-logger.ts'

export interface GithubFileInfo {
  owner: string
  repo: string
  branch: string
  filePath: string
}

export class GithubUtils {
  static downloadFromGithubRaw({ owner, repo, branch, filePath }: GithubFileInfo, saveTo: string) {
    mainLogger.debug('downloadFromGithubRaw', { owner, repo, branch, filePath }, saveTo)
    return new Promise<void>((resolvePromise, rejectPromise) => {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`
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

  static parseGithubUrl(url: string): GithubFileInfo {
    // 去掉 git+ 前缀
    url = url.replace(/^git\+/, '')

    const regexBase = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/)?$/
    const regexFile = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/

    // 情况 1：git clone 地址 或 repo 根路径
    const m1 = url.match(regexBase)
    if (m1) {
      return {
        owner: m1[1],
        repo: m1[2],
        branch: 'main', // 默认分支 main
        filePath: '', // 根路径没有具体文件
      }
    }

    // 情况 2：具体文件路径
    const m2 = url.match(regexFile)
    if (m2) {
      return {
        owner: m2[1],
        repo: m2[2],
        branch: m2[3],
        filePath: m2[4],
      }
    }

    throw new CommonError('解析插件仓库URL失败');
  }
}
