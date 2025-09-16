import { registerGlobalData } from '@/main/api/invoke/invoke-api-global.ts'
import { HOST_GLOBAL_DATA } from '@/shared/common/host-global-data.ts'
import { execBiz } from '@ybgnb/utils'
import { invokeDBApi } from '@/main/api/invoke/invoke-api-db.ts'
import { defaultAppThemeState } from '@/shared/common/app-constants.ts'

/**
 * 宿主环境自动注册的全局数据
 */
export const hostAppRegisterGlobal = () => {
  // 主题状态
  registerGlobalData('host', HOST_GLOBAL_DATA.APP_THEME_STATE, async () => {
    return execBiz(async () => {
      return await invokeDBApi('init', HOST_GLOBAL_DATA.APP_THEME_STATE, defaultAppThemeState)
    })
  })
}
