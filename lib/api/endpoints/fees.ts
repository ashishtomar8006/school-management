import { api } from '../client'
import type { ApiResponse, PaginatedResponse, ListParams } from '../types'

export type FeeStatus        = 'paid' | 'pending' | 'overdue'
export type FeeFrequency     = 'monthly' | 'quarterly' | 'half-yearly' | 'annual'
export type PaymentMethod    = 'cash' | 'online' | 'cheque' | 'dd'

export interface FeeStructure {
  id: string
  class: string
  section?: string
  feeType: string
  amount: number
  dueDate: string
  frequency: FeeFrequency
  academicYear?: string
}

export interface FeeRecord {
  id: string
  studentId: string
  feeStructureId?: string
  feeType: string
  amount: number
  dueDate: string
  paidDate?: string
  status: FeeStatus
  paymentMethod?: PaymentMethod
  receiptNumber?: string
  remarks?: string
  student?: {
    id: string
    rollNumber: string
    class: string
    section: string
    user: { name: string }
  }
}

export interface FeeRecordParams extends ListParams {
  studentId?: string
  status?: FeeStatus
  feeType?: string
}

export interface ProcessPaymentPayload {
  paymentMethod: PaymentMethod
  remarks?: string
}

export const feesApi = {
  // Structures
  listStructures: (params?: { class?: string; academicYear?: string }) =>
    api.get<ApiResponse<FeeStructure[]>>('/fees/structures', params),

  createStructure: (data: Omit<FeeStructure, 'id'>) =>
    api.post<ApiResponse<FeeStructure>>('/fees/structures', data),

  updateStructure: (id: string, data: Partial<FeeStructure>) =>
    api.put<ApiResponse<FeeStructure>>(`/fees/structures/${id}`, data),

  deleteStructure: (id: string) =>
    api.delete<ApiResponse<null>>(`/fees/structures/${id}`),

  generateFromStructure: (id: string) =>
    api.post<ApiResponse<{ created: number }>>(`/fees/structures/${id}/generate`),

  // Records
  listRecords: (params?: FeeRecordParams) =>
    api.get<PaginatedResponse<FeeRecord>>('/fees/records', params),

  createRecord: (data: Omit<FeeRecord, 'id' | 'student'>) =>
    api.post<ApiResponse<FeeRecord>>('/fees/records', data),

  updateRecord: (id: string, data: Partial<FeeRecord>) =>
    api.put<ApiResponse<FeeRecord>>(`/fees/records/${id}`, data),

  processPayment: (id: string, data: ProcessPaymentPayload) =>
    api.put<ApiResponse<FeeRecord>>(`/fees/records/${id}/pay`, data),
}
