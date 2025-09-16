import { invokeApi } from './base-invoke'
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'
import type { AppLog, AppThemeState, ToolkitSystemApi } from 'bilitoolkit-api-types'

export const invokeSystemApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitSystemApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeApi<ToolkitSystemApi, T>('system', name, ...args)
}

export const systemApi: ToolkitSystemApi = {
  browsePage(path: string): Promise<void> {
    return invokeSystemApi('browsePage', path);
  },
  showItemInFolder(path: string): Promise<void> {
    return invokeSystemApi('showItemInFolder', path);
  },
  saveLog(appLog: AppLog): Promise<void> {
    return invokeSystemApi('saveLog', appLog);
  },
  shouldUseDarkColors(): Promise<boolean> {
    return invokeSystemApi('shouldUseDarkColors');
  },
  getAppThemeState: function (): Promise<AppThemeState> {
    return invokeSystemApi('getAppThemeState');
  }
}
