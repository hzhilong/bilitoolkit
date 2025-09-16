import type { HostEventChannel } from '@/shared/types/host-event-channel.ts'

/**
 * IPC 事件发射者
 */
export interface IpcEventEmiter {
  // 事件通道
  channel: HostEventChannel | string
  // 数据负载
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any[]
}

/**
 * 事件监听器
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventListener = (...args: any[]) => void
