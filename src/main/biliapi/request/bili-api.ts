import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import type { BiliApi, ApiRequestParams } from '@/main/biliapi/types/bili-api-request.ts'
import { BiliConstants } from '@/main/biliapi/common/bili-constants.ts'
import { wbiSign } from '@/main/biliapi/request/wbi-sign.ts'
import { mainLogger } from '@/main/common/main-logger.ts'
import {
  type BiliApiResponse,
  BiliApiBusinessError,
  BiliApiHttpError,
  type BiliApiRequest,
} from 'bilitoolkit-api-types'
import { mergeRequestConfig, mergeRequestHeaders } from '@/main/biliapi/utils/axios-utils.ts'
import { CommonError } from '@ybgnb/utils'
import { initMixinKey } from '@/main/biliapi/request/mixin-key.ts'

// 创建BiliApi
const createBiliApi = (): BiliApi => {
  // 创建axios实例
  const axiosInstance = axios.create({
    baseURL: BiliConstants.BASE_URL,
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9',
      origin: 'https://space.bilibili.com',
      priority: 'u=1, i',
      referer: `https://www.bilibili.com/?spm_id_from=333.999.0.0`,
      'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    },
  })

  // 添加请求拦截器
  axiosInstance.interceptors.request.use(
    function (config) {
      if (config.method === 'post' && config.wbiSign === undefined) {
        // post 必须进行wbi签名
        config.wbiSign = true
      }
      if (config.wbiSign && config.params && Object.keys(config.params).length > 0) {
        // wbi 签名且参数不为空
        config.url = `${config.url}?${wbiSign(config.params)}`
        config.params = undefined
      }
      mainLogger.debug(`BiliAPI 请求 [${config.method} ${config.url}]`, config.params || '')
      return config
    },
    function (error) {
      return Promise.reject(error)
    },
  )

  // 添加响应拦截器，统一处理响应
  axiosInstance.interceptors.response.use(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (response: AxiosResponse<BiliApiResponse<any>>) => {
      mainLogger.debug(`BiliAPI 响应 [${response.config.method} ${response.config.url}]`, JSON.stringify(response.data))
      if (response.config.parseBizError === false) {
        // 不需要自动解析业务异常
        return response
      }
      const apiResponse = response.data

      if (apiResponse.code !== 0) {
        throw new BiliApiBusinessError(apiResponse.message || '操作失败', apiResponse.code || -1, apiResponse.data)
      }

      return response
    },
    (error: AxiosError) => {
      // HTTP 请求层面的错误（网络错误、超时、状态码超出2xx）
      throw new BiliApiHttpError(error.message, error.response?.status, error.code, error)
    },
  )

  // 定义接口基础请求方法
  async function request<TD = object, D extends BiliApiRequest = BiliApiRequest>(
    url: string,
    config: AxiosRequestConfig<D>,
  ): Promise<AxiosResponse<BiliApiResponse<TD>> | BiliApiResponse<TD> | TD> {
    try {
      // 合并默认配置
      mergeRequestConfig(config, {
        parseBizError: true,
        wbiSign: true,
        returnType: 'apiData',
        csrf: true,
        withCredentials: false,
      })
      // 合并请求头
      mergeRequestHeaders(config, {
        cookie: config.accountCookie?.cookies,
      })
      if (config.method === 'post' && config.csrf) {
        // 需要 wbi签名或者 csrf
        if (!config.accountCookie?.bili_jct) {
          throw new CommonError('账号未登录，不支持添加csrf参数')
        }
        if (config.data) {
          config.data.csrf = config.accountCookie?.bili_jct
        } else {
          config.data = {
            csrf: config.accountCookie?.bili_jct,
          } as D
        }
      }
      // 发起请求
      const axiosResponse = await axiosInstance<BiliApiResponse<TD>, AxiosResponse<BiliApiResponse<TD>>, D>(url, config)
      if (config.returnType === 'httpResponse') {
        return axiosResponse
      } else if (config.returnType === 'apiResponse') {
        return axiosResponse.data
      } else {
        return axiosResponse.data.data
      }
    } catch (error: unknown) {
      if (error instanceof BiliApiHttpError) {
        // HTTP 错误
        mainLogger.log(`请求接口[${url}]出错[${error.status}]`, error.message)
        throw error
      } else if (error instanceof BiliApiBusinessError) {
        // 业务逻辑错误
        mainLogger.debug(`请求接口[${url}]失败`, error)
        throw error
      } else {
        mainLogger.log(`请求接口[${url}]时出现未知错误`, error)
        throw error
      }
    }
  }

  // 创建增强的API
  const enhancedApi = request as BiliApi
  enhancedApi.initMixinKey = initMixinKey
  // 封装 get 请求
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enhancedApi.get = <TD = any>(url: string, params: ApiRequestParams, config?: AxiosRequestConfig): Promise<TD> => {
    return request(url, { ...config, params }) as Promise<TD>
  }
  // 封装 post 请求
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enhancedApi.post = <TD = any, D extends BiliApiRequest = BiliApiRequest>(
    url: string,
    data: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<TD> => {
    return request(url, config === undefined ? { data } : { ...config, data }) as Promise<TD>
  }

  return enhancedApi
}

/**
 * 统一接口请求方法
 */
export const biliApi = createBiliApi()
