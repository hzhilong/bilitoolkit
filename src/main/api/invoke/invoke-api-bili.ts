import { invokeApi } from './base-invoke'
import type {
  ToolkitBiliApi,
  BiliUserApi,
  LoginQRCode,
  LoginResultOfQRCode,
  BiliAccountCookie,
  BiliAccount,
} from 'bilitoolkit-api-types'
import type { LeafFunctionPaths } from '@/main/types/ipc-toolkit-api.ts'

export const invokeBiliApi = async <T = void>(
  name: LeafFunctionPaths<ToolkitBiliApi> & string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> => {
  return await invokeApi<ToolkitBiliApi, T>('bili', name, ...args)
}

const user: BiliUserApi = {
  getLoginQRCode(): Promise<LoginQRCode> {
    return invokeBiliApi('user.getLoginQRCode')
  },
  loginByQRCode(qrcode_key: string): Promise<LoginResultOfQRCode> {
    return invokeBiliApi('user.loginByQRCode', qrcode_key)
  },
  getMyInfo(accountCookie: BiliAccountCookie): Promise<BiliAccount> {
    return invokeBiliApi('user.getMyInfo', accountCookie)
  },
}

export const biliApi: ToolkitBiliApi = {
  user: user,
}
