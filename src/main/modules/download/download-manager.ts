import { downloadRecordRepository } from '@/main/db/repository/download.js'
import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.js'
import { AppError, type DownloadTask, type DownloadTaskFilters, type DownloadCreateOptions } from 'bilitoolkit-types'
import { DownloadRunner } from '@/main/modules/download/download-runner.js'
import type { DownloadRecord } from '@/shared/types/download.js'
import { mapDownloadRecordToRow } from '@/main/db/utils/db.js'
import { toDownloadTask } from '@/main/utils/download.js'
import { getErrorMessage } from '@ybgnb/utils'
import type { PageParams, PageResult } from 'bilitoolkit-ui'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import { webContents } from 'electron'
import { windowManager } from '@/main/window/window-manager.js'

class DownloadManager {
  runners: Map<number, DownloadRunner> = new Map()
  webIds: Map<number, number> = new Map()
  downloadQueue: DownloadRunner[] = []

  async bootstrap() {
    await downloadRecordRepository.pauseAllRunning()
  }

  async addToQueue(runner: DownloadRunner) {
    await runner.pending()
    if (!this.downloadQueue.includes(runner)) {
      this.downloadQueue.push(runner)
    }
    if (this.downloadQueue.length === 1) {
      runner.download().then().catch()
    }
  }

  removeFromQueue(runner?: DownloadRunner) {
    if (runner && this.downloadQueue.includes(runner)) {
      this.downloadQueue.splice(this.downloadQueue.indexOf(runner), 1)
    }
  }

  getFirstInQueue(): DownloadRunner | null {
    if (this.downloadQueue.length === 0) {
      return null
    } else {
      return this.downloadQueue[0]
    }
  }

  getPluginId(context: ApiCallerContext): 'core' | string {
    return context.envType === 'host' ? 'core' : context.plugin.id
  }

  checkPluginEnv(context: ApiCallerContext, record: DownloadRecord) {
    const pluginId = this.getPluginId(context)
    if (pluginId !== 'core' && pluginId !== record.pluginId) {
      throw new AppError('操作失败，暂无权限操作该下载任务')
    }
  }

  async stopAllRunning(excludeId?: number) {
    for (const [id, value] of this.runners) {
      if (excludeId == null || excludeId !== id) await value.pause()
    }
  }

  async create(context: ApiCallerContext, { userCookie, videos, title, settings }: DownloadCreateOptions) {
    const record: Omit<DownloadRecord, 'id'> = {
      title: title,
      videos: videos,
      status: 'pending',
      createdAt: Math.floor(new Date().getTime() / 1000),
      userCookie: userCookie,
      pluginId: this.getPluginId(context),
      settings: settings,
    }
    let recordId: number | null = null
    try {
      const newRecord = await downloadRecordRepository.add(mapDownloadRecordToRow(record))
      recordId = newRecord.id
      const task = toDownloadTask(newRecord)
      const runner = new DownloadRunner({
        task,
        fileRoot: context.filePath,
        listener: this,
      })
      await this.addToQueue(runner)
      this.runners.set(recordId, runner)
      this.webIds.set(recordId, context.webContents.id)
      return task
    } catch (error) {
      if (recordId != null) {
        await downloadRecordRepository.update(recordId, {
          status: 'failed',
          error: getErrorMessage(error),
        })
        this.runners.delete(recordId)
        this.webIds.delete(recordId)
      }
      throw error
    }
  }

  async onTaskUpdate(id: DownloadTask['id'], update: Partial<Omit<DownloadTask, 'id'>>) {
    update.updatedAt = Math.floor(new Date().getTime() / 1000)
    const task = await downloadRecordRepository.getById(id)
    if (task) {
      if (update.status === 'completed') {
        update.progress = {
          ...task.progress!,
          percent: 100,
        }
      }
      await downloadRecordRepository.update(id, mapDownloadRecordToRow(update))

      const updatedTask = await downloadRecordRepository.getById(id)
      if (updatedTask) {
        const pluginWebId = this.webIds.get(id)
        const hostWeb = windowManager.getHostWebContents()
        hostWeb.send(IPC_CHANNELS.DOWNLOAD_TASK_UPDATE, updatedTask)
        if (pluginWebId != null && pluginWebId !== hostWeb.id) {
          webContents.fromId(pluginWebId)?.send(IPC_CHANNELS.DOWNLOAD_TASK_UPDATE, updatedTask)
        }
      }
    }
    if (update.status != null && update.status !== 'downloading' && update.status !== 'merging') {
      this.removeFromQueue(this.runners.get(id))
      this.dispatch()
    }
  }

  private dispatching = false

  private dispatch() {
    if (this.dispatching) return

    this.dispatching = true
    try {
      const runner = this.getFirstInQueue()
      if (runner) {
        runner.download().then().catch()
      }
    } finally {
      this.dispatching = false
    }
  }

  async baseGet<E extends boolean = false>(
    context: ApiCallerContext,
    id: number,
    checkExist: E,
  ): Promise<E extends false ? DownloadRecord | null : DownloadRecord> {
    const record = await downloadRecordRepository.getById(id)
    if (record) {
      this.checkPluginEnv(context, record)
    }
    if (checkExist && !record) {
      throw new AppError('下载任务不存在')
    }
    return record as unknown as Promise<E extends false ? DownloadRecord | null : DownloadRecord>
  }

  async baseGetRunner(context: ApiCallerContext, id: number | DownloadRecord) {
    const record = typeof id === 'number' ? await this.baseGet(context, id, true) : id
    if (this.runners.has(record.id)) {
      return this.runners.get(record.id)!
    } else {
      const runner = new DownloadRunner({
        task: record,
        fileRoot: context.filePath,
        listener: this,
      })
      this.runners.set(record.id, runner)
      this.webIds.set(record.id, context.webContents.id)
      return runner
    }
  }

  async get(context: ApiCallerContext, id: number) {
    return this.baseGet(context, id, false)
  }

  async cancel(context: ApiCallerContext, id: number) {
    const runner = await this.baseGetRunner(context, id)
    await runner.cancel()
    this.removeFromQueue(runner)
    this.dispatch()
  }

  async pause(context: ApiCallerContext, id: number) {
    const runner = await this.baseGetRunner(context, id)
    await runner.pause()
    this.removeFromQueue(runner)
    this.dispatch()
  }

  async pauseAll(context: ApiCallerContext) {
    const list = await downloadRecordRepository.getDownloadList(this.getPluginId(context))
    for (const record of list) {
      const runner = await this.baseGetRunner(context, record)
      await runner.pause()
      this.removeFromQueue(runner)
    }
    this.dispatch()
  }

  async resume(context: ApiCallerContext, id: number) {
    const runner = await this.baseGetRunner(context, id)
    await this.addToQueue(runner)
  }

  async resumeAll(context: ApiCallerContext) {
    const list = await downloadRecordRepository.getPauseList(this.getPluginId(context))
    for (const record of list) {
      await this.addToQueue(await this.baseGetRunner(context, record))
    }
  }

  async remove(
    context: ApiCallerContext,
    id: number,
    options?: {
      deleteFiles?: boolean
    },
  ) {
    const runner = await this.baseGetRunner(context, id)
    await runner.cancel()
    if (options?.deleteFiles) {
      await runner.deleteAllFile()
    }
    this.removeFromQueue(runner)
    this.runners.delete(id)
    await downloadRecordRepository.deleteById(id)
  }

  async fetchPage(
    context: ApiCallerContext,
    pageParams: PageParams,
    filter: DownloadTaskFilters,
  ): Promise<PageResult<DownloadTask>> {
    const pluginId = this.getPluginId(context)
    return downloadRecordRepository.fetchPage(pageParams, filter, pluginId === 'core' ? undefined : pluginId)
  }
}

export const downloadManager = new DownloadManager()
