import type { ApiCallerEnvType } from '@/main/types/ipc-toolkit-api.ts'
import { CommonError } from '@ybgnb/utils'

export class ApiGlobalUtils {
/*   /!**
   * 获取全局数据的key
   * @param envType
   * @param name
   *!/
  static getGlobalDataKey(envType: 'host', name: string): string
  static getGlobalDataKey(envType: 'plugin', name: string, pluginId: string): string
  static getGlobalDataKey(envType: ApiCallerEnvType, name: string, pluginId?: string): string {
    if (pluginId != undefined) {
      return `${envType}-${pluginId}-${name}`
    } else {
      return `${envType}-${name}`
    }
  } */

  /**
   * 解析全局数据的key
   * @param globalDataKey
   */
/*   static parseGlobalDataKey(globalDataKey: string): { envType: ApiCallerEnvType; name: string } {
    if (globalDataKey.startsWith('host')) {
      return {
        envType: 'host',
        name: globalDataKey.slice('host'.length + 1),
      }
    } else if (globalDataKey.startsWith('plugin')) {
      return {
        envType: 'plugin',
        name: globalDataKey.slice('plugin'.length + 1),
      }
    }
    throw new CommonError('数据名称错误')
  } */
}
