import { api } from '../client'
import type { ApiResponse, PaginatedResponse, ListParams } from '../types'

export type ComplaintCategory = 'academic' | 'discipline' | 'bullying' | 'facilities' | 'other'
export type ComplaintStatus   = 'open' | 'in-progress' | 'resolved' | 'closed'
export type ComplaintPriority = 'low' | 'medium' | 'high'

export interface Complaint {
  id: string
  complaintCode: string
  title: string
  description: string
  category: ComplaintCategory
  status: ComplaintStatus
  priority: ComplaintPriority
  createdById: string
  assignedToId?: string
  resolution?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  createdBy?: { id: string; name: string; role: string }
  assignedTo?: { id: string; name: string; role: string }
}

export interface ComplaintParams extends ListParams {
  status?: ComplaintStatus
  priority?: ComplaintPriority
  category?: ComplaintCategory
}

export interface CreateComplaintPayload {
  title: string
  description: string
  category: ComplaintCategory
  priority?: ComplaintPriority
}

export interface UpdateComplaintPayload {
  status?: ComplaintStatus
  priority?: ComplaintPriority
  assignedToId?: string
  resolution?: string
}

export const complaintsApi = {
  list: (params?: ComplaintParams) =>
    api.get<PaginatedResponse<Complaint>>('/complaints', params),

  getById: (id: string) =>
    api.get<ApiResponse<Complaint>>(`/complaints/${id}`),

  create: (data: CreateComplaintPayload) =>
    api.post<ApiResponse<Complaint>>('/complaints', data),

  update: (id: string, data: UpdateComplaintPayload) =>
    api.put<ApiResponse<Complaint>>(`/complaints/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/complaints/${id}`),
}
