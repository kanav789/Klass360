import { apiRequest } from '@/lib/api'
import type {
  AuthResponse,
  LoginPayload,
  MeResponse,
  RegisterPayload,
} from '@/types/auth'

export const authService = {
  register: (payload: RegisterPayload) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      token: null,
    }),

  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      token: null,
    }),

  getMe: () => apiRequest<MeResponse>('/auth/me'),

  logout: () =>
    apiRequest<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),
}
