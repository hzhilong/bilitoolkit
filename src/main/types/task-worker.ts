import type { LogLevel } from '@ybgnb/utils'

/**
 * 工作线程的数据
 */
export interface WorkerData {
  code: string
  taskContext: Record<string, unknown>
}

export interface ErrorMsg {
  type: 'error'
  name?: string
  message: string
  stack?: string
}

/**
 * rpc 调用 API 的请求
 */
export interface RpcApiRequestMsg {
  type: 'rpc:api:call'
  callId: string
  path: string[]
  args: unknown[]
}

/**
 * rpc 调用 API 的结果
 */
export type RpcApiResultMsg =
  | { type: 'rpc:api:result'; callId: string; ok: true; value: unknown }
  | { type: 'rpc:api:result'; callId: string; ok: false; error: Omit<ErrorMsg, 'type'> }

/**
 * rpc 调用logger的请求
 */
export interface RpcLogRequestMsg {
  type: 'rpc:log:call'
  logLevel: LogLevel
  data: string
}
