/**
 * Common/Generic API Types
 */

/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  error?: string
}

/** Generic error response */
export interface ApiError {
  success: false
  message: string
  error?: string
  statusCode?: number
}

/** Pagination metadata */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

/** Request with pagination */
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

/** File upload type */
export interface FileUpload {
  file: File
  name: string
  size: number
  type: string
}

/** Generic list query filters */
export interface ListQuery extends PaginationParams {
  search?: string
  filters?: Record<string, any>
}
