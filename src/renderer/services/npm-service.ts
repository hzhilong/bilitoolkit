// 假设搜索框绑定到 searchText
import axios from 'axios'
import type { NpmSearchParams, NpmSearchResult } from '@/shared/types/npm-types.ts'
import { BaseUtils, CommonError } from '@ybgnb/utils'
import { logger } from '@/renderer/common/renderer-logger.ts'

export async function searchNpmPackages(params: NpmSearchParams): Promise<NpmSearchResult> {
  try {
    const response = await axios.get('https://registry.npmjs.org/-/v1/search', {
      params: {
        text: `keywords:${params.keywords}`, // 使用 scope: 前缀来精确搜索
        size: 20, // 返回结果数量
        from: params.page && params.page > 1 ? (params.page - 1) * 20 : undefined, // 偏移
      },
    })
    return response.data
  } catch (error) {
    logger.error('搜索 npm 包失败:', error)
    throw new CommonError('搜索 npm 包失败：' + BaseUtils.getErrorMessage(error))
  }
}
