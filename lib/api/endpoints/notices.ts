import { api } from '../client'
import type { ApiResponse, PaginatedResponse, ListParams } from '../types'

export type NoticeCategory = 'general' | 'academic' | 'event' | 'urgent'
export type NoticeAudience = 'all' | 'teachers' | 'students' | 'parents' | 'staff'

export interface Notice {
  id: string
  title: string
  content: string
  category: NoticeCategory
  audience: NoticeAudience
  createdById: string
  expiryDate?: string
  attachments: string[]
  isPublished: boolean
  createdAt: string
  createdBy?: { id: string; name: string; role: string }
}

export interface NoticeParams extends ListParams {
  category?: NoticeCategory
  audience?: NoticeAudience
}

export interface CreateNoticePayload {
  title: string
  content: string
  category?: NoticeCategory
  audience?: NoticeAudience
  expiryDate?: string
  attachments?: string[]
  isPublished?: boolean
}

export const noticesApi = {
  list: (params?: NoticeParams) =>
    api.get<PaginatedResponse<Notice>>('/notices', params),

  getById: (id: string) =>
    api.get<ApiResponse<Notice>>(`/notices/${id}`),

  create: (data: CreateNoticePayload) =>
    api.post<ApiResponse<Notice>>('/notices', data),

  update: (id: string, data: Partial<CreateNoticePayload>) =>
    api.put<ApiResponse<Notice>>(`/notices/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/notices/${id}`),
}
