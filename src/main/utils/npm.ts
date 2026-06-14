import path from 'path'
import { appPath } from '@/main/common/app-path.js'
import { writeFileSync, unlinkSync } from 'node:fs'
import * as tar from 'tar'
import type { PluginDownloadOptions } from '@/shared/types/toolkit-plugin.js'
import { convertToCommonError } from '@ybgnb/utils'
import { ensureDirSync } from '@ybgnb/utils/node'
import { getPackage } from 'public-registry-api'

export default class NpmUtils {
  static pkgNameToDirName(pkgName: string) {
    return pkgName.replace('/', '_')
  }

  /**
   * 下载 npm 包并解压到指定目录并返回
   */
  static async downloadPluginPackage(options: PluginDownloadOptions, version: string = 'latest') {
    try {
      // 获取 package info
      const pkgInfo = await getPackage(options.id)

      // 获取指定版本
      const ver = version === 'latest' ? pkgInfo['dist-tags'].latest : version
      const tarballUrl = pkgInfo.versions[ver].dist.tarball

      // 下载 tarball
      const arrayBuffer = await fetch(tarballUrl).then((r) => r.arrayBuffer())
      const tarballBuffer = Buffer.from(arrayBuffer)

      // 临时保存 tarball
      const tempFile = path.join(appPath.temp, `${options.pluginDirName}-${ver}.tgz`)
      writeFileSync(tempFile, tarballBuffer)

      const tarTo = path.join(appPath.pluginsPath, `${options.pluginDirName}`)
      ensureDirSync(tarTo)

      // 解压
      await tar.x({
        file: tempFile,
        cwd: tarTo,
        strip: 1, // 去掉 package/ 根目录
      })

      // 删除临时文件
      unlinkSync(tempFile)
      return tarTo
    } catch (error: unknown) {
      throw convertToCommonError(error, `下载插件包[${options.id}-${version}]时出错`)
    }
  }
}
