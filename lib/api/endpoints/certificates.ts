import { api } from '../client'
import type { ApiResponse, PaginatedResponse, ListParams } from '../types'

export type CertType   = 'character' | 'transfer' | 'bonafide' | 'completion' | 'sports' | 'achievement'
export type CertStatus = 'active' | 'revoked'

export interface Certificate {
  id: string
  certificateNo: string
  studentId: string
  type: CertType
  issuedDate: string
  validUntil?: string
  issuerName?: string
  issuerDesignation?: string
  purpose?: string
  remarks?: string
  status: CertStatus
  student?: { id: string; rollNumber: string; class: string; section: string; user: { name: string } }
  createdAt?: string
}

export const certificatesApi = {
  list:    (params?: ListParams & { type?: CertType; status?: CertStatus; studentId?: string; search?: string }) =>
    api.get<PaginatedResponse<Certificate>>('/certificates', params),
  getById: (id: string)               => api.get<ApiResponse<Certificate>>(`/certificates/${id}`),
  create:  (data: Partial<Certificate>) => api.post<ApiResponse<Certificate>>('/certificates', data),
  update:  (id: string, data: Partial<Certificate>) => api.put<ApiResponse<Certificate>>(`/certificates/${id}`, data),
  revoke:  (id: string)               => api.put<ApiResponse<Certificate>>(`/certificates/${id}/revoke`, {}),
}
