import type { AxiosRequestConfig } from 'axios'
import type { BiliApiRequest } from 'bilitoolkit-api-types'

/**
 * 哔哩api请求
 */
export interface BiliApi {
  /**
   * 初始化mixinKey
   */
  initMixinKey: () => Promise<void>

  /**
   * 基础请求方法
   * @param url url
   * @param config 请求配置
   * @template {any} TD 接口响应数据类型（非http响应）
   * @template {any} D 请求数据类型
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <TD = any, D = any>(url: string, config: AxiosRequestConfig<D>): Promise<TD>

  /**
   * 封装的get请求，已在内部处理业务异常（config.parseBizError !== false）
   * @template {any} TD 接口响应数据类型
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: <TD = any>(url: string, params: ApiRequestParams, config?: AxiosRequestConfig) => Promise<TD>
  /**
   * 封装的post请求，已在内部处理业务异常（config.parseBizError !== false）
   * @template {any} TD 接口响应数据类型
   * @template {any} D 请求数据类型
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: <TD = any, D extends BiliApiRequest = BiliApiRequest>(url: string, data: D, config?: AxiosRequestConfig<D>) => Promise<TD>
}

/**
 * 接口请求URL参数
 */
export type ApiRequestParams = Record<string, string | number | object>
/**
 * 请求返回类型（不是响应类型）
 */
export type RequestReturnType = 'httpResponse' | 'apiResponse' | 'apiData'
