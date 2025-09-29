import { appEnv } from '@/shared/common/app-env.ts'

/**
 * 主进程环境变量
 */
export const mainEnv = {
  ...appEnv,
  isLinux(): boolean {
    return process.platform === 'linux'
  },
  isMacOS(): boolean {
    return process.platform === 'darwin'
  },
  isWindows(): boolean {
    return process.platform === 'win32'
  },
}
