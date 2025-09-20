// IPC 通道
export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]

// IPC 通道对象
export const IPC_CHANNELS = {
  PLUGIN_APIS: 'PLUGIN_APIS',
  REQUEST_DATA: 'REQUEST_DATA',
  RESPONSE_DATA: 'RESPONSE_DATA',
  TOOLKIT_EVENT: 'TOOLKIT_EVENT',
} as const
