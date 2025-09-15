/**
 * 主进程环境变量
 */
export const mainEnv = {
  isDev() {
    return process.env.NODE_ENV === 'development'
  },
  isProd() {
    return process.env.NODE_ENV === 'production'
  },
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
