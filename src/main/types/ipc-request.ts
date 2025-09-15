import { BizResult } from '@ybgnb/utils'

/**
 * IPC 请求体（主要用于 主进程=>渲染进程）
 */
export interface IpcRequestBody<T> {
  reqId: string
  // 目标
  name: string
  args?: T[]
}

/**
 * IPC 响应（主要用于 主进程=>渲染进程）
 */
export interface IpcResponseBody<T> {
  reqId: string
  // 目标
  name: string
  data: BizResult<T>
}

export const toIpcResponseBody = <Q, P>(req: IpcRequestBody<Q>, data: BizResult<P>): IpcResponseBody<P> => {
  return {
    reqId: req.reqId,
    name: req.name,
    data: data,
  }
}
