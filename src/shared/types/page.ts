export type PageParams<C = object> = C & {
  pageSize: number
  pageNum: number
}

export interface PageData {
  pageNum: number
  pageSize: number
  totalPages: number
  total: number
}

export interface PageResult<C> extends PageData {
  data: C[]
}
