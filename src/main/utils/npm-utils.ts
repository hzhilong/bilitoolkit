import axios from 'axios'
import path from 'path'
import { appPath } from '@/main/common/app-path.ts'
import { writeFileSync, unlinkSync } from 'node:fs'
import * as tar from 'tar'
import { FileUtils } from '@/main/utils/file-utils.ts'
import { BaseUtils } from '@ybgnb/utils'

export default class NpmUtils {
  static pkgNameToDirName(pkgName: string) {
    return pkgName.replace('/', '_')
  }

  /**
   * 下载 npm 包并解压到指定目录并返回
   * @param pkgName
   * @param version
   */
  static async downloadPluginPackage(pkgName: string, version: string = 'latest') {
    try {
      const dirName = this.pkgNameToDirName(pkgName)
      // 获取 package info
      const registryUrl = `https://registry.npmjs.org/${pkgName}`
      const { data: pkgInfo } = await axios.get(registryUrl)

      // 获取指定版本
      const ver = version === 'latest' ? pkgInfo['dist-tags'].latest : version
      const tarballUrl = pkgInfo.versions[ver].dist.tarball

      // 下载 tarball
      const response = await axios.get(tarballUrl, { responseType: 'arraybuffer' })
      const tarballBuffer = Buffer.from(response.data)

      // 临时保存 tarball
      const tempFile = path.join(appPath.temp, `${dirName}-${ver}.tgz`)
      writeFileSync(tempFile, tarballBuffer)

      const tarTo = path.join(appPath.pluginsPath, `${dirName}`)
      FileUtils.ensureDirExists(tarTo)

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
      throw BaseUtils.convertToCommonError(error, `下载插件包[${pkgName}-${version}]时出错`)
    }
  }
}
