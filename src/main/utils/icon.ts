import type { ToolkitPlugin, InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { appPath } from '@/main/common/app-path.js'
import path from 'path'
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'node:fs'
import { mainLogger } from '@/main/common/main-logger.js'
import NpmUtils from '@/main/utils/npm.js'
import { APP_FILE_KEYS } from '@/shared/common/app-files.js'
import { downloadFile, emptyDirectory } from '@ybgnb/utils/node'
import { parsePluginIconUrl } from '@/shared/utils/plugin-parse.js'

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

  static async clearPluginIconCache() {
    await emptyDirectory(path.join(appPath.hostAppFilePath, APP_FILE_KEYS.PLUGIN_ICON))
  }

  static convertIconFile(filePath: string, mediaType: MediaType) {
    const base64 = this.readIconBase64(filePath, mediaType)
    writeFileSync(filePath, base64, 'utf8')
    return base64
  }

  static async downloadPluginIcon(plugin: ToolkitPlugin) {
    const saveTo = this.getPluginIconCachePath(plugin.id)
    if (existsSync(saveTo)) {
      return readFileSync(saveTo, 'utf8')
    }
    try {
      const icoUrl = parsePluginIconUrl(plugin.id)

      if (!icoUrl) {
        return this.getDefaultPluginIcon()
      }
      mainLogger.debug('下载插件图标', icoUrl)
      await downloadFile(icoUrl, saveTo)
      return this.convertIconFile(saveTo, 'image/x-icon')
    } catch (error: unknown) {
      mainLogger.error('下载插件图标失败', error)
      if (existsSync(saveTo)) {
        unlinkSync(saveTo)
      }
      return this.getDefaultPluginIcon()
    }
  }

  static getInstalledPluginIcon(plugin: InstalledToolkitPlugin) {
    let pluginDist
    if (path.isAbsolute(plugin.files.distPath)) {
      pluginDist = plugin.files.distPath
    } else {
      pluginDist = path.resolve(appPath.pluginsPath, plugin.files.distPath)
    }

    const ico = path.join(pluginDist, 'icon.png')
    if (existsSync(ico)) {
      return this.readIconBase64(ico, 'image/png')
    }
    return this.getDefaultPluginIcon()
  }
}
