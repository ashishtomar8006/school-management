import { api } from '../client'
import type { ApiResponse } from '../types'

export interface RouteStop {
  id: string
  routeId: string
  stopName: string
  pickupTime: string
  dropTime: string
  order: number
  landmark?: string
}

export interface BusRoute {
  id: string
  routeName: string
  startPoint: string
  endPoint: string
  totalDistance?: string
  estimatedTime?: string
  status: 'active' | 'inactive'
  stops?: RouteStop[]
  buses?: { id: string; busNumber: string; status: string }[]
}

export interface Bus {
  id: string
  busNumber: string
  registrationNumber: string
  driverName: string
  driverPhone?: string
  conductorName?: string
  conductorPhone?: string
  capacity: number
  routeId?: string
  status: 'active' | 'maintenance' | 'inactive'
  yearOfManufacture?: string
  route?: BusRoute
}

export interface BusAssignment {
  id: string
  studentId: string
  busId: string
  pickupStop: string
  assignedDate: string
  status: 'active' | 'inactive'
  bus?: Bus
  student?: { id: string; class: string; section: string; user: { name: string } }
}

export interface CreateRoutePayload {
  routeName: string
  startPoint: string
  endPoint?: string
  totalDistance?: string
  estimatedTime?: string
  status?: 'active' | 'inactive'
  stops?: Omit<RouteStop, 'id' | 'routeId'>[]
}

export interface CreateBusPayload {
  busNumber: string
  registrationNumber: string
  driverName: string
  driverPhone?: string
  conductorName?: string
  conductorPhone?: string
  capacity: number
  routeId?: string
  status?: 'active' | 'maintenance' | 'inactive'
  yearOfManufacture?: string
}

export interface AssignStudentPayload {
  studentId: string
  busId: string
  pickupStop: string
}

export const busesApi = {
  // Routes
  listRoutes: (params?: { status?: string }) =>
    api.get<ApiResponse<BusRoute[]>>('/transport/routes', params),

  getRoute: (id: string) =>
    api.get<ApiResponse<BusRoute>>(`/transport/routes/${id}`),

  createRoute: (data: CreateRoutePayload) =>
    api.post<ApiResponse<BusRoute>>('/transport/routes', data),

  updateRoute: (id: string, data: Partial<CreateRoutePayload>) =>
    api.put<ApiResponse<BusRoute>>(`/transport/routes/${id}`, data),

  deleteRoute: (id: string) =>
    api.delete<ApiResponse<null>>(`/transport/routes/${id}`),

  // Stops
  addStop: (routeId: string, data: Omit<RouteStop, 'id' | 'routeId'>) =>
    api.post<ApiResponse<RouteStop>>(`/transport/routes/${routeId}/stops`, data),

  updateStop: (routeId: string, stopId: string, data: Partial<RouteStop>) =>
    api.put<ApiResponse<RouteStop>>(`/transport/routes/${routeId}/stops/${stopId}`, data),

  deleteStop: (routeId: string, stopId: string) =>
    api.delete<ApiResponse<null>>(`/transport/routes/${routeId}/stops/${stopId}`),

  // Buses
  listBuses: (params?: { status?: string; routeId?: string }) =>
    api.get<ApiResponse<Bus[]>>('/transport/buses', params),

  getBus: (id: string) =>
    api.get<ApiResponse<Bus>>(`/transport/buses/${id}`),

  createBus: (data: CreateBusPayload) =>
    api.post<ApiResponse<Bus>>('/transport/buses', data),

  updateBus: (id: string, data: Partial<CreateBusPayload>) =>
    api.put<ApiResponse<Bus>>(`/transport/buses/${id}`, data),

  deleteBus: (id: string) =>
    api.delete<ApiResponse<null>>(`/transport/buses/${id}`),

  // Assignments
  listAssignments: (params?: { busId?: string; status?: string }) =>
    api.get<ApiResponse<BusAssignment[]>>('/transport/assignments', params),

  assignStudent: (data: AssignStudentPayload) =>
    api.post<ApiResponse<BusAssignment>>('/transport/assignments', data),

  updateAssignment: (id: string, data: Partial<AssignStudentPayload>) =>
    api.put<ApiResponse<BusAssignment>>(`/transport/assignments/${id}`, data),

  removeAssignment: (id: string) =>
    api.delete<ApiResponse<null>>(`/transport/assignments/${id}`),
}
