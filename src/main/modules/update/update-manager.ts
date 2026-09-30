import { appEnv } from '@ybgnb/vite-env/common'
import electronUpdater, { type ProgressInfo, type UpdateDownloadedEvent, type UpdateInfo } from 'electron-updater'
import { dialog } from 'electron'
import { getAppSettings } from '@/main/utils/host-app.js'
import type { AppUpdateStatus } from '@/shared/types/toolkit-core-api.js'

class AppUpdateManager {
  updateTask: null | Promise<void> = null
  ignoreResult = false
  // 是否显示上次检查更新为最新版本的提示
  showLastCheckUpToDateTip: boolean = false
  private status: AppUpdateStatus = { phase: 'idle' }

  init() {
    const autoUpdater = electronUpdater.autoUpdater
    autoUpdater.on('checking-for-update', () => {
      this.status = { phase: 'checking', message: '正在检查更新' }
    })
    autoUpdater.on('update-available', (event: UpdateInfo) => {
      this.showLastCheckUpToDateTip = false
      this.status = {
        phase: 'downloading',
        version: event.version,
        percent: 0,
        message: `发现新版本 ${event.version}，正在后台下载`,
      }
    })
    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      this.status = {
        phase: 'downloading',
        version: this.status.version,
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
        message: '正在下载更新',
      }
    })
    autoUpdater.on('update-not-available', (event: UpdateInfo) => {
      this.status = {
        phase: 'up-to-date',
        version: event.version,
        message: '当前已经是最新版本',
      }
      if (this.showLastCheckUpToDateTip) {
        dialog.showMessageBox({
          type: 'info',
          buttons: ['确定'],
          title: '提示',
          message: `当前已经是最新版本`,
        })
        this.showLastCheckUpToDateTip = false
      }
    })
    autoUpdater.on('update-downloaded', async (event: UpdateDownloadedEvent) => {
      this.status = {
        phase: 'downloaded',
        version: event.version,
        percent: 100,
        message: `新版本 ${event.version} 已下载完成；暂不安装时，将在退出软件后自动安装`,
      }
      if (this.ignoreResult) return
      const { response } = await dialog.showMessageBox({
        type: 'info',
        buttons: ['立即安装', '暂不安装'],
        title: '检测到新版本',
        message: `新版本 ${event.version} 已下载完成`,
      })

      if (response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
    autoUpdater.on('error', (error: Error) => {
      this.showLastCheckUpToDateTip = false
      this.status = {
        phase: 'error',
        message: error.message || '检查更新失败',
      }
    })
    if (appEnv.PROD && getAppSettings().autoUpdateOnStartup) {
      void this.checkUpdate()
    }
  }

  async checkUpdate() {
    this.ignoreResult = false
    if (this.updateTask) {
      return this.updateTask
    }

    this.status = { phase: 'checking', message: '正在检查更新' }
    this.updateTask = (async () => {
      try {
        if (!appEnv.PROD) {
          this.showLastCheckUpToDateTip = false
          this.status = {
            phase: 'error',
            message: '开发版不支持应用内更新检查，请使用正式安装版验证更新功能',
          }
          return
        }
        const result = await electronUpdater.autoUpdater.checkForUpdatesAndNotify()
        if (!result && this.status.phase === 'checking') {
          this.showLastCheckUpToDateTip = false
          this.status = {
            phase: 'error',
            message: '更新服务未返回检查结果，请稍后重试',
          }
        }
      } catch (error) {
        this.showLastCheckUpToDateTip = false
        this.status = {
          phase: 'error',
          message: error instanceof Error ? error.message : '检查更新失败',
        }
        throw error
      } finally {
        this.updateTask = null
      }
    })()

    return this.updateTask
  }

  getStatus(): AppUpdateStatus {
    return { ...this.status }
  }

  async cancelCheck() {
    this.ignoreResult = true
  }
}

export const appUpdateManager = new AppUpdateManager()
