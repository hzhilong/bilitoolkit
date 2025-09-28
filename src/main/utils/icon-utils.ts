import type { ToolkitPlugin, InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { appPath } from '@/main/common/app-path.ts'
import path from 'path'
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'node:fs'
import { GithubUtils } from '@/main/utils/github-utils.ts'
import { mainLogger } from '@/main/common/main-logger.ts'
import { parseGithubRepo } from '@/shared/utils/github-parse.ts'
import NpmUtils from '@/main/utils/npm-utils.ts'
import { APP_FILE_KEYS } from '@/shared/common/app-files.ts'

let defaultPluginIcon: string | undefined = undefined

type MediaType = 'image/x-icon' | 'image/jpeg' | 'image/png'

export class IconUtils {
  static readIconBase64(filePath: string, mediaType: MediaType): string {
    const data = readFileSync(filePath)
    return `data:${mediaType};base64,${data.toString('base64')}`
  }

  static getDefaultPluginIcon() {
    if (!defaultPluginIcon) {
      defaultPluginIcon = this.readIconBase64(appPath.defaultPluginIcon, 'image/png')
    }
    return defaultPluginIcon
  }

  /**
   * 获取插件图标缓存的相对路径
   * @param pluginId
   * @private
   */
  static getPluginIconCachePath(pluginId: string) {
    return path.join(appPath.hostAppFilePath, APP_FILE_KEYS.PLUGIN_ICON, `${NpmUtils.pkgNameToDirName(pluginId)}.icon`)
  }

  static convertIconFile(filePath: string, mediaType: MediaType) {
    const base64 = this.readIconBase64(filePath, mediaType)
    writeFileSync(filePath, base64, 'utf8')
    return base64
  }

  static async downloadPluginIcon(plugin: ToolkitPlugin) {
    mainLogger.debug('下载插件图标', plugin)
    if (!plugin.links.repository) {
      return this.getDefaultPluginIcon()
    }
    const saveTo = this.getPluginIconCachePath(plugin.id)
    if (existsSync(saveTo)) {
      return readFileSync(saveTo, 'utf8')
    }
    try {
      const repo = parseGithubRepo(plugin.links.repository)
      try {
        await GithubUtils.downloadFromGithubRaw(repo, 'public/favicon.ico', saveTo)
        return this.convertIconFile(saveTo, 'image/x-icon')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (ignored) {
        await GithubUtils.downloadFromGithubRaw(repo, 'public/favicon.png', saveTo)
        return this.convertIconFile(saveTo, 'image/png')
      }
    } catch (error: unknown) {
      mainLogger.error('下载插件图标失败', plugin, error)
      if (existsSync(saveTo)) {
        unlinkSync(saveTo)
      }
      return this.getDefaultPluginIcon()
    }
  }

  static getInstalledPluginIcon(plugin: InstalledToolkitPlugin) {
    const ico = path.join(appPath.pluginsPath, plugin.files.distPath, 'favicon.ico')
    if (existsSync(ico)) {
      return this.readIconBase64(ico, 'image/x-icon')
    }
    const png = path.join(appPath.pluginsPath, plugin.files.distPath, 'favicon.png')
    if (existsSync(png)) {
      return this.readIconBase64(png, 'image/png')
    }
    return this.getDefaultPluginIcon()
  }
}
