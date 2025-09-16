import { BizResult } from "@ybgnb/utils";

/**
 * IPC 请求体（主要用于 主进程=>渲染进程）
 */
export interface IpcRequestBody {
  reqId: string
  // 目标
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[]
}

/**
 * IPC 响应（主要用于 主进程=>渲染进程）
 */
export interface IpcResponseBody {
  reqId: string
  // 目标
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: BizResult<any>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toIpcResponseBody = (req: IpcRequestBody, data: BizResult<any>): IpcResponseBody => {
  return {
    reqId: req.reqId,
    name: req.name,
    data: data,
  }
}
