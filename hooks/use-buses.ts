'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import {
  busesApi,
  BusRoute,
  Bus,
  BusAssignment,
  CreateRoutePayload,
  CreateBusPayload,
  AssignStudentPayload,
  RouteStop,
} from '@/lib/api/endpoints/buses'
import { useQuery, useMutation } from './use-query'

export function useBusRoutes(params?: { status?: string }) {
  const fetcher = useCallback(
    () => busesApi.listRoutes(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  const { data: routes, loading, error, refetch } = useQuery<BusRoute[]>(fetcher)

  const { mutate: createRoute, loading: creating } = useMutation(
    (data: CreateRoutePayload) => busesApi.createRoute(data),
    { onSuccess: () => { toast.success('Route created.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateRoute, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateRoutePayload> }) =>
      busesApi.updateRoute(id, data),
    { onSuccess: () => { toast.success('Route updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteRoute, loading: deleting } = useMutation(
    (id: string) => busesApi.deleteRoute(id),
    { onSuccess: () => { toast.success('Route deleted.'); refetch() }, onError: toast.error }
  )

  const { mutate: addStop, loading: addingStop } = useMutation(
    ({ routeId, data }: { routeId: string; data: Omit<RouteStop, 'id' | 'routeId'> }) =>
      busesApi.addStop(routeId, data),
    { onSuccess: () => { toast.success('Stop added.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteStop, loading: deletingStop } = useMutation(
    ({ routeId, stopId }: { routeId: string; stopId: string }) =>
      busesApi.deleteStop(routeId, stopId),
    { onSuccess: () => { toast.success('Stop removed.'); refetch() }, onError: toast.error }
  )

  return {
    routes: routes ?? [],
    loading, error, refetch,
    createRoute, updateRoute, deleteRoute,
    addStop, deleteStop,
    creating, updating, deleting, addingStop, deletingStop,
  }
}

export function useBuses(params?: { status?: string; routeId?: string }) {
  const fetcher = useCallback(
    () => busesApi.listBuses(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  const { data: buses, loading, error, refetch } = useQuery<Bus[]>(fetcher)

  const { mutate: createBus, loading: creating } = useMutation(
    (data: CreateBusPayload) => busesApi.createBus(data),
    { onSuccess: () => { toast.success('Bus added.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateBus, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateBusPayload> }) =>
      busesApi.updateBus(id, data),
    { onSuccess: () => { toast.success('Bus updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteBus, loading: deleting } = useMutation(
    (id: string) => busesApi.deleteBus(id),
    { onSuccess: () => { toast.success('Bus removed.'); refetch() }, onError: toast.error }
  )

  return { buses: buses ?? [], loading, error, refetch, createBus, updateBus, deleteBus, creating, updating, deleting }
}

export function useBusAssignments(params?: { busId?: string; status?: string }) {
  const fetcher = useCallback(
    () => busesApi.listAssignments(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  const { data: assignments, loading, error, refetch } = useQuery<BusAssignment[]>(fetcher)

  const { mutate: assignStudent, loading: assigning } = useMutation(
    (data: AssignStudentPayload) => busesApi.assignStudent(data),
    { onSuccess: () => { toast.success('Student assigned.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateAssignment, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<AssignStudentPayload> }) =>
      busesApi.updateAssignment(id, data),
    { onSuccess: () => { toast.success('Assignment updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: removeAssignment, loading: removing } = useMutation(
    (id: string) => busesApi.removeAssignment(id),
    { onSuccess: () => { toast.success('Student removed from bus.'); refetch() }, onError: toast.error }
  )

  return {
    assignments: assignments ?? [],
    loading, error, refetch,
    assignStudent, updateAssignment, removeAssignment,
    assigning, updating, removing,
  }
}
