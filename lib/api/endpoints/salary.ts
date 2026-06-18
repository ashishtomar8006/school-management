import { api } from '../client'
import type { ApiResponse, PaginatedResponse, ListParams } from '../types'

export type SalaryStatus = 'pending' | 'processed' | 'paid'

export interface SalaryRecord {
  id: string
  teacherId: string
  month: string
  year: number
  baseSalary: number
  da: number
  hra: number
  conveyance: number
  medicalAllowance: number
  otherAllowances: number
  pf: number
  tax: number
  otherDeductions: number
  netSalary: number
  status: SalaryStatus
  paymentDate?: string
  paymentMethod?: string
  remarks?: string
  teacher?: { id: string; user: { name: string; email: string } }
}

export interface SalaryParams extends ListParams {
  teacherId?: string
  month?: string
  year?: number
  status?: SalaryStatus
}

export interface CreateSalaryPayload {
  teacherId: string
  month: string
  year: number
  baseSalary: number
  da?: number
  hra?: number
  conveyance?: number
  medicalAllowance?: number
  otherAllowances?: number
  pf?: number
  tax?: number
  otherDeductions?: number
  remarks?: string
}

export const salaryApi = {
  list: (params?: SalaryParams) =>
    api.get<PaginatedResponse<SalaryRecord>>('/salary', params),

  getById: (id: string) =>
    api.get<ApiResponse<SalaryRecord>>(`/salary/${id}`),

  create: (data: CreateSalaryPayload) =>
    api.post<ApiResponse<SalaryRecord>>('/salary', data),

  update: (id: string, data: Partial<CreateSalaryPayload>) =>
    api.put<ApiResponse<SalaryRecord>>(`/salary/${id}`, data),

  processPayment: (id: string, paymentMethod: string) =>
    api.put<ApiResponse<SalaryRecord>>(`/salary/${id}/pay`, { paymentMethod }),

  bulkGenerate: (month: string, year: number) =>
    api.post<ApiResponse<{ created: number }>>('/salary/bulk-generate', { month, year }),
}
