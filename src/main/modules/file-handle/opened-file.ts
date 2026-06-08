import type { FileStat, FileReadResult, FileSeekWhence, FileHandle } from 'bilitoolkit-types'
import fs from 'fs'

export class OpenedFile implements FileHandle {
  offset: number
  file: fs.promises.FileHandle

  constructor(file: fs.promises.FileHandle, offset: number = 0) {
    this.file = file
    this.offset = offset
  }

  async close(): Promise<void> {
    await this.file.close()
  }

  async stat(): Promise<FileStat> {
    const stat = await this.file.stat()
    return {
      size: stat.size,
      createdAt: stat.ctimeMs,
      modifiedAt: stat.mtimeMs,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
    }
  }

  async write(data: Uint8Array): Promise<void> {
    const { bytesWritten } = await this.file.write(data, 0, data.length, this.offset)
    this.offset += bytesWritten
  }

  async flush(): Promise<void> {
    await this.file.datasync()
  }

  async read(size: number = 64 * 1024): Promise<FileReadResult> {
    const buffer = new Uint8Array(size)

    const { bytesRead } = await this.file.read(buffer, 0, size, this.offset)

    this.offset += bytesRead

    const stat = await this.file.stat()

    return {
      data: buffer.subarray(0, bytesRead),
      eof: this.offset >= stat.size,
    }
  }

  async seek(offset: number, whence: FileSeekWhence = 'start') {
    switch (whence) {
      case 'start':
        this.offset = offset
        break
      case 'current':
        this.offset += offset
        break
      case 'end': {
        const stat = await this.file.stat()
        this.offset = stat.size + offset
        break
      }
    }
  }

  async tell() {
    return this.offset
  }
}
