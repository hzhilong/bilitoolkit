import { toolkitApi } from '@/renderer/api/toolkit-api'
import { BaseUtils, CommonError } from '@ybgnb/utils'
import { onUnmounted, ref } from 'vue'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import type { BiliAccount, BiliAccountCookie } from 'bilitoolkit-api-types'

/**
 * 登录二维码
 */
export function useLoginQRCode() {
  const loginResult = ref('')
  const qrCodeUrl = ref('')
  const qrCodeImg = useQRCode(qrCodeUrl)

  let timer: ReturnType<typeof setInterval> | null = null
  const clearTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // 是否正在登录
  let isLoggingIn = false
  // 是否取消登录
  let isCancelLogin = false

  const cancelLogin = () => {
    isCancelLogin = true
    clearTimer()
  }

  onUnmounted(() => {
    clearTimer()
  })

  // 登录成功的监听器
  type LoggedInListener = (account: BiliAccount) => void
  let loggedInListener: LoggedInListener | undefined = undefined
  const onLoginSuccess = (fn: LoggedInListener) => {
    loggedInListener = fn
  }
  // 刷新二维码
  const refreshQRCode = async () => {
    isLoggingIn = false
    isCancelLogin = false
    clearTimer()
    loginResult.value = ''
    try {
      const qrCode = await toolkitApi.bili.user.getLoginQRCode()
      qrCodeUrl.value = qrCode.url
      timer = setInterval(() => {
        if (isLoggingIn || isCancelLogin) {
          return;
        }
        login(qrCode.qrcode_key)
      }, 1111)
    } catch (err: unknown) {
      loginResult.value = BaseUtils.getErrorMessage(err)
    }
  }
  // 扫码登录
  const login = async (qrCodeKey: string) => {
    try {
      isLoggingIn = true
      // 获取登录结果
      const apiLoginResult = await toolkitApi.bili.user.loginByQRCode(qrCodeKey)
      if (!timer) return

      // 二维码已失效
      if (apiLoginResult.code === 86038) throw new CommonError(apiLoginResult.message)

      if (!apiLoginResult.accountCookie) {
        // 登录中
        loginResult.value = apiLoginResult.message
      } else {
        // 登录完成
        clearTimer()
        loginResult.value = '已登录，正在获取用户信息...'
        await getLoggedInUser(apiLoginResult.accountCookie)
      }
    } catch (err) {
      // 登录失败
      clearTimer()
      loginResult.value = BaseUtils.getErrorMessage(err)
    } finally {
      isLoggingIn = false
    }
  }
  // 获取登录的用户信息
  const getLoggedInUser = async (accountCookie: BiliAccountCookie) => {
    const user = await toolkitApi.bili.user.getMyInfo(accountCookie)
    if (loggedInListener) {
      loggedInListener(user)
    }
  }

  return {
    qrCodeImg,
    loginResult,
    refreshQRCode,
    onLoginSuccess,
    cancelLogin,
  }
}
