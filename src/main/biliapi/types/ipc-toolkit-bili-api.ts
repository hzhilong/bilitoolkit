import type { BiliAccount, BiliUserApi, BiliAccountId } from 'bilitoolkit-api-types'

/**
 * 自动添加 BiliAccount 参数
 * （使用Webstorm生成方法时，针对只有一个BiliAccountId参数的方法，需要手动删除多出来的泛型）
 */
export type AddAccountContext<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? P extends [BiliAccountId, ...infer Rest]
      ? (account: BiliAccount, ...args: Rest) => R
      : (...args: P) => R
    : T[K] extends object
      ? AddAccountContext<T[K]>
      : T[K]
}

type IpcUserApi = AddAccountContext<BiliUserApi>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IpcBiliUserApi extends IpcUserApi {}
