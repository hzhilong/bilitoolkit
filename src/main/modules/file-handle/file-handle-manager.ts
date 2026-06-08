import type { ApiCallerContext } from '@/main/types/ipc-toolkit-api.js'
import type { FileHandleId, IpcFilePayload } from '@/main/types/ipc-file.js'
import { resolveSafeFilePath } from '@/main/utils/file.js'
import { generateId } from '@/main/utils/id.js'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@/shared/types/electron-ipc.js'
import { windowManager } from '@/main/window/window-manager.js'
import fs from 'fs'
import { execBiz } from '@ybgnb/utils'
import { OpenedFile } from '@/main/modules/file-handle/opened-file.js'

export class FileHandleManger {
  openedFiles = new Map<FileHandleId, OpenedFile>()

  init() {
    ipcMain.handle(IPC_CHANNELS.FILE_HANDLE, async (event, { operation, args }: IpcFilePayload) => {
      return execBiz(async () => {
        const context = windowManager.getApiCallerContext(event)

        switch (operation) {
          case 'open':
            return this.open(context, args[0], args[1])
          case 'close':
          case 'stat':
          case 'write':
          case 'flush':
          case 'read':
          case 'seek':
          case 'tell':
            const openedFile = this.getOpenedFile(args[0])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fn = openedFile[operation] as (...args: any[]) => any | Promise<any>
            return await fn.call(openedFile, ...args.slice(1))
          default:
            throw new Error(`内部错误，未能识别 ${String(operation)} 文件操作`)
        }
      })
    })
  }

  async open(context: ApiCallerContext, filePath: string, flags: string | number = 'w+'): Promise<FileHandleId> {
    const absolutePath = await resolveSafeFilePath(context, filePath)
    const file = await fs.promises.open(absolutePath, flags)
    const handleId = generateId()
    this.openedFiles.set(handleId, new OpenedFile(file))
    return handleId
  }

  private getOpenedFile(handleId: FileHandleId) {
    const file = this.openedFiles.get(handleId)
    if (!file) {
      throw new Error(`内部错误，未找到该文件 handleId=${handleId}`)
    }
    return file
  }
}

export const fileHandleManger = new FileHandleManger()
