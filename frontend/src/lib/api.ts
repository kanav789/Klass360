import type { ApiErrorResponse } from '@/types/auth'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export function getAssetUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

export const AUTH_TOKEN_KEY = 'klass360_auth_token'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getStoredToken(): string | null {
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    sessionStorage.getItem(AUTH_TOKEN_KEY)
  )
}

export function setStoredToken(token: string, remember = false): void {
  clearStoredToken()

  if (remember) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    return
  }

  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  token?: string | null
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...rest } = options

  const authToken = token ?? getStoredToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = data as ApiErrorResponse | null
    throw new ApiError(
      error?.message || 'Something went wrong. Please try again.',
      response.status,
    )
  }

  return data as T
}

export async function apiFormRequest<T>(
  endpoint: string,
  formData: FormData,
  options: Omit<RequestOptions, 'body'> = {},
): Promise<T> {
  const { token, headers, ...rest } = options
  const authToken = token ?? getStoredToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: formData,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = data as ApiErrorResponse | null
    throw new ApiError(
      error?.message || 'Something went wrong. Please try again.',
      response.status,
    )
  }

  return data as T
}
