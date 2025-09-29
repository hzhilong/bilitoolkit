export interface NpmPackage {
  package: {
    /** 包名称 */
    name: string
    /** 包版本号 */
    version: string
    /** 包描述 */
    description: string
    /** 关键字列表，用于搜索和分类 */
    keywords: string[]
    /** 发布时间，ISO 格式字符串 */
    date: string
    /** 相关链接 */
    links: {
      /** npm 页面链接 */
      npm: string
      /** 包的主页，可选 */
      homepage?: string
      /** 仓库地址，可选 */
      repository?: string
      /** 问题追踪页面，可选 */
      bugs?: string
    }
    /** 发布者信息 */
    publisher: {
      /** 发布者用户名 */
      username: string
      /** 发布者邮箱 */
      email: string
    }
    /** 维护者列表 */
    maintainers: Array<{
      /** 维护者用户名 */
      username: string
      /** 维护者邮箱 */
      email: string
    }>
  }
  score: {
    /** 最终综合评分 */
    final: number
    /** 分项评分详情 */
    detail: {
      /** 质量评分 */
      quality: number
      /** 流行度评分 */
      popularity: number
      /** 维护情况评分 */
      maintenance: number
    }
  }
  /** 搜索得分，用于排序 */
  searchScore: number
  /** 下载量 */
  downloads: {
    monthly: number
    weekly: number
  }
}

export interface NpmSearchParams {
  keywords: string
  page?: number
}

export interface NpmSearchResult {
  total: number
  time: string
  objects: Array<NpmPackage>
}
