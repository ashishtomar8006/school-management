const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'

// ── Token helpers ──────────────────────────────────────────────────────────────

export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

export const setToken = (token: string) =>
  localStorage.setItem('auth_token', token)

export const removeToken = () =>
  localStorage.removeItem('auth_token')

// ── Error class ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: { field?: string; message: string }[],
    /** The specific form field this error belongs to (sent by server for 409 conflicts) */
    public field?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** True for duplicate-field conflicts (email already exists, etc.) */
  get isFieldConflict() {
    return this.status === 409 && !!this.field
  }
}

// ── Request builder ────────────────────────────────────────────────────────────

type Params = Record<string, string | number | boolean | undefined | null>

async function request<T>(
  endpoint: string,
  options: RequestInit & { params?: Params } = {}
): Promise<T> {
  const { params, headers: extraHeaders, ...init } = options

  let url = `${BASE_URL}${endpoint}`
  if (params) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v))
    })
    const str = qs.toString()
    if (str) url += `?${str}`
  }

  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders ?? {}),
  }

  const response = await fetch(url, { ...init, headers })
  const json = await response.json().catch(() => ({ message: 'Invalid server response' }))

  if (!response.ok) {
    throw new ApiError(
      json.message ?? `HTTP ${response.status}`,
      response.status,
      json.errors,
      json.field   // ← field name from server (present on 409 responses)
    )
  }

  return json as T
}

// ── HTTP verbs ─────────────────────────────────────────────────────────────────

export const api = {
  get:    <T>(url: string, params?: Params) => request<T>(url, { method: 'GET', params }),
  post:   <T>(url: string, body?: unknown)  => request<T>(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(url: string, body?: unknown)  => request<T>(url, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(url: string, body?: unknown)  => request<T>(url, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(url: string)                  => request<T>(url, { method: 'DELETE' }),
}
