import { api } from '../client'
import type { ApiResponse } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'principal' | 'teacher' | 'student' | 'parent'
  phone?: string
  address?: string
  avatar?: string
  joinDate?: string
  isActive: boolean
}

export interface LoginResponse {
  token: string
  user: AuthUser
  profile: Record<string, unknown> | null
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string
  address?: string
}

export interface PrincipalRegisterPayload {
  name:        string
  email:       string
  password:    string
  phone?:      string
  address?:    string
  schoolName?: string
}

export const authApi = {
  // Standard login — teachers / students / parents
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', payload),

  // Principal portal
  principalRegister: (payload: PrincipalRegisterPayload) =>
    api.post<ApiResponse<LoginResponse>>('/auth/principal/register', payload),

  principalLogin: (payload: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>('/auth/principal/login', payload),

  // Admin portal
  adminLogin: (payload: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>('/auth/admin/login', payload),

  getMe: () =>
    api.get<ApiResponse<{ user: AuthUser; profile: Record<string, unknown> | null }>>('/auth/me'),

  changePassword: (payload: ChangePasswordPayload) =>
    api.put<ApiResponse<null>>('/auth/change-password', payload),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.put<ApiResponse<{ user: AuthUser }>>('/auth/profile', payload),
}
