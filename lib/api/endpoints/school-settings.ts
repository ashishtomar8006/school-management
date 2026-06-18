import { api } from '../client'
import type { ApiResponse } from '../types'

export interface SchoolSettingsData {
  schoolName:       string
  tagline:          string
  address:          string
  phone:            string
  email:            string
  website:          string
  principalName:    string
  logoDataUrl:      string
  signatureDataUrl: string
  themeColorId:     string
}

export const schoolSettingsApi = {
  get: () =>
    api.get<ApiResponse<{ settings: SchoolSettingsData }>>('/school-settings'),

  update: (data: Partial<SchoolSettingsData>) =>
    api.put<ApiResponse<{ settings: SchoolSettingsData }>>('/school-settings', data),
}
