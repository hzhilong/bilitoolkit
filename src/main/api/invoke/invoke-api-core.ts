import { invokeApi } from './base-invoke'
import type { ToolkitCoreApi } from '@/shared/types/toolkit-core-api.ts'
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'
import type { PluginInstallOptions, ToolkitPlugin, InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'

export const invokeCoreApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitCoreApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeApi<ToolkitCoreApi, T>('core', name, ...args)
}

export const coreApi: ToolkitCoreApi = {
  getLogsFolderSize(): Promise<string> {
    return invokeCoreApi('getLogsFolderSize')
  },
  getDBsFolderSize(): Promise<string> {
    return invokeCoreApi('getDBsFolderSize')
  },
  getFilesFolderSize(): Promise<string> {
    return invokeCoreApi('getFilesFolderSize')
  },
  openLogsFolder(): Promise<void> {
    return invokeCoreApi('openLogsFolder')
  },
  openDBsFolder(): Promise<void> {
    return invokeCoreApi('openDBsFolder')
  },
  openFilesFolder(): Promise<void> {
    return invokeCoreApi('openFilesFolder')
  },
  updatedLoggedInAccounts(): Promise<void> {
    return invokeCoreApi('updatedLoggedInAccounts')
  },
  hideCurrPlugin(): Promise<void> {
    return invokeCoreApi('hideCurrPlugin')
  },
  closePlugin(plugin: ToolkitPlugin): Promise<void> {
    return invokeCoreApi('closePlugin', plugin)
  },
  getInstalledPlugins(): Promise<ToolkitPlugin[]> {
    return invokeCoreApi('getInstalledPlugins')
  },
  installPlugin(options: PluginInstallOptions): Promise<InstalledToolkitPlugin> {
    return invokeCoreApi('installPlugin', options)
  },
  openPlugin(plugin: ToolkitPlugin): Promise<void> {
    return invokeCoreApi('openPlugin', plugin)
  },
  uninstallPlugin(id: string): Promise<void> {
    return invokeCoreApi('uninstallPlugin', id)
  },
  hideAppDialogWindow: function (): Promise<void> {
    return invokeCoreApi('hideAppDialogWindow')
  },
  getPluginIcon(plugin: ToolkitPlugin): Promise<string> {
    return invokeCoreApi('getPluginIcon', plugin)
  },
}
