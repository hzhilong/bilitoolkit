import type { AxiosRequestConfig } from 'axios'

/**
 * 合并默认请求配置
 */
export const mergeRequestConfig = (config: AxiosRequestConfig | undefined, defaultConfig: AxiosRequestConfig) => {
  if (!config) return defaultConfig
  Object.keys(defaultConfig).forEach((key) => {
    const cKey = key as keyof AxiosRequestConfig
    config[cKey] = config[cKey] ?? defaultConfig[cKey]
  })
  return config
}
/**
 * 合并默认请求头部
 */
export const mergeRequestHeaders = (config: AxiosRequestConfig, headers: Record<string, string | undefined>) => {
  if (config.headers === undefined) {
    config.headers = headers
  } else {
    Object.keys(headers).forEach((key) => {
      config.headers![key] = config.headers?.[key] ?? headers[key]
    })
  }
  return config
}
