'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { certificatesApi, Certificate, CertType } from '@/lib/api/endpoints/certificates'
import { usePaginatedQuery, useMutation } from './use-query'

export function useCertificates(params?: { type?: CertType; studentId?: string }) {
  const fetcher = useCallback(
    () => certificatesApi.list(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  const { data: certificates, pagination, loading, error, refetch } = usePaginatedQuery<Certificate>(fetcher)

  const { mutate: createCertificate, loading: creating } = useMutation(
    (data: Partial<Certificate>) => certificatesApi.create(data),
    { onSuccess: () => { toast.success('Certificate issued.'); refetch() }, onError: toast.error }
  )
  const { mutate: updateCertificate, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<Certificate> }) => certificatesApi.update(id, data),
    { onSuccess: () => { toast.success('Certificate updated.'); refetch() }, onError: toast.error }
  )
  const { mutate: revokeCertificate, loading: revoking } = useMutation(
    (id: string) => certificatesApi.revoke(id),
    { onSuccess: () => { toast.success('Certificate revoked.'); refetch() }, onError: toast.error }
  )

  return {
    certificates, pagination, loading, error, refetch,
    createCertificate, updateCertificate, revokeCertificate,
    creating, updating, revoking,
  }
}
