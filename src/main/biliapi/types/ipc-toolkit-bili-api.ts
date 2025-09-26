import type { AuthAccount, BiliUserApi } from 'bilitoolkit-api-types'

export type BiliAccount = AuthAccount

/**
 * 自动添加 BiliAccount 参数
 */
export type AddAccountContext<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? (context: BiliAccount, ...args: P) => R
    : T[K] extends object
      ? AddAccountContext<T[K]> // 关键递归逻辑
      : never
}

type IpcUserApi = AddAccountContext<BiliUserApi>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IpcBiliUserApi extends IpcUserApi {}
