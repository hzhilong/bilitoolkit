import { mainLogger } from '@/main/common/main-logger.ts'
import { FileUtils } from '@/main/utils/file-utils'
import { AbortedError, CommonError } from '@ybgnb/utils'
import { exec } from 'child_process'
import fs from 'fs'
import iconv from 'iconv-lite'
import path from 'node:path'
import * as url from 'node:url'

const cmdEncoding = 'binary'
const cmdResultEncoding = 'cp936'

/**
 * 编码命令
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const encodeCmd = (cmd: string) => {
  return iconv.encode(cmd, 'ascii').toString(cmdEncoding)
}
/**
 * 解码命令
 */
const decodeCmd = (cmd: string) => {
  return iconv.decode(Buffer.from(cmd, cmdEncoding), cmdResultEncoding)
}

/**
 * 命令执行的选项
 */
interface ExecCmdOptions {
  /**
   * 判断结果码是否成功
   * @param number 结果码
   */
  codeIsSuccess?: (number: number) => boolean
  /**
   * 终止信号
   */
  signal?: AbortSignal
}

export class Win32Utils {
  /**
   * 执行命令
   * @param command
   * @param options
   */
  static execCmd(command: string, options?: ExecCmdOptions): Promise<string>
  static execCmd(command: string, options?: ExecCmdOptions, filePath?: string): Promise<number>
  static execCmd(command: string, options?: ExecCmdOptions, filePath?: string): Promise<string | number> {
    mainLogger.debug(`ExecCmd ${command}`, `with ${filePath}`)
    return new Promise((resolve, reject) => {
      // 前置检查：如果 signal 已终止，直接拒绝
      if (options?.signal?.aborted) {
        reject(new AbortedError())
        return
      }

      const child = exec(`${command}`, { encoding: cmdEncoding }, (error, stdout, stderr) => {
        stdout = decodeCmd(stdout)
        stderr = decodeCmd(stderr)

        // 清理 abort 监听（如果存在）
        options?.signal?.removeEventListener('abort', abortHandler)

        const exitCode = error ? Number((error as NodeJS.ErrnoException).code ?? 0) : 0
        mainLogger.debug(`cmd: [${command}](code: ${exitCode}):${stderr}`)
        if (options?.codeIsSuccess ? !options.codeIsSuccess(exitCode) : exitCode !== 0) {
          reject(new Error(`命令行执行出错 (${exitCode}): ${stderr || stdout}`))
        } else {
          if (filePath) {
            resolve(FileUtils.getFileSizeKB(filePath))
          } else {
            resolve(stdout)
          }
        }
      })
      // 定义 abort 处理函数
      const abortHandler = () => {
        child.kill('SIGTERM') // 终止进程
        reject(new AbortedError())
      }
      // 注册 abort 监听
      if (options?.signal) {
        options.signal.addEventListener('abort', abortHandler)
      }

      // 可选：进程意外终止处理
      child.on('close', () => {
        options?.signal?.removeEventListener('abort', abortHandler)
      })
    })
  }

  /**
   * 打开资源管理器
   * @param fileOrDir 定位的目录或文件
   */
  static async showItemInFolder(fileOrDir: string): Promise<void> {
    fileOrDir = path.resolve(fileOrDir)
    const href = url.pathToFileURL(fileOrDir).href
    if (fs.existsSync(fileOrDir)) {
      if (fs.lstatSync(fileOrDir).isFile()) {
        mainLogger.debug(`打开资源管理器定位文件，路径：${fileOrDir}，转码：${href}`)
        await Win32Utils.execCmd(`start "" explorer /select,"${fileOrDir}"`)
        // return shell.showItemInFolder(href)
      } else {
        mainLogger.debug(`打开资源管理器，路径：${fileOrDir}，转码：${href}`)
        // return shell.openExternal(href)
        await Win32Utils.execCmd(`start "" "${fileOrDir}"`)
      }
    } else {
      throw new CommonError('该文件/文件夹不存在')
    }
  }

  /**
   * 打开注册表
   * @param path 显示的路径
   */
  static openRegedit(path: string) {
    return Win32Utils.execCmd(
      `taskkill /f /im regedit.exe & REG ADD "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Applets\\Regedit" /v "LastKey" /d "${path}" /f & regedit`,
    )
  }

  /**
   * 确保文件路径的目录存在
   * @param filePath 完整的文件路径
   */
  static ensureDirectoryExistence(filePath: string) {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  /**
   * 导出注册表
   * @param regPath 注册表路径
   * @param filePath 导出的文件路径
   */
  static exportRegedit(regPath: string, filePath: string): Promise<number> {
    filePath = path.resolve(filePath)
    Win32Utils.ensureDirectoryExistence(filePath)
    return Win32Utils.execCmd(`reg export "${regPath}" "${filePath}" /y`, undefined, filePath)
  }

  /**
   * 导入注册表
   * @param regPath 注册表路径
   * @param filePath 导入的文件路径
   */
  static importRegedit(regPath: string, filePath: string): Promise<number> {
    filePath = path.resolve(filePath)
    return Win32Utils.execCmd(`reg import "${filePath}"`, undefined, filePath)
  }

  /**
   * 通用拷贝工具：支持文件或文件夹
   */
  static copyFile(source: string, destination: string, signal?: AbortSignal): Promise<number> {
    const src = path.resolve(source)
    const dest = path.resolve(destination)

    let command: string

    const isFile = FileUtils.isFile(source)
    if (isFile) {
      // 文件用 copy 命令
      command = `copy "${src}" "${dest}"`
      return Win32Utils.execCmd(command, undefined, dest)
    } else {
      // 文件夹用 robocopy
      command = `robocopy "${src}" "${dest}" /E /NFL /NDL /NJH /NJS /NC /NS /NP`
      return Win32Utils.execCmd(
        command,
        {
          codeIsSuccess: (number) => number < 8,
          signal: signal,
        },
        dest,
      )
    }
  }

  /**
   * 获取环境变量
   */
  static getEnv(): { [p: string]: string } {
    const env: { [p: string]: string } = {}
    for (const envKey in process.env) {
      env[envKey] = process.env[envKey] as string
    }
    return env
  }
}
