// ── Standard API response shapes ───────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T = unknown> {
  success: boolean
  message: string
  data: T[]
  pagination: Pagination
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Shared query param shapes ──────────────────────────────────────────────────

export interface ListParams {
  page?: number
  limit?: number
  search?: string
}
