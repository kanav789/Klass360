import { apiRequest } from '@/lib/api'
import { withQueryParams } from '@/lib/query'
import type {
  ListQueryParams,
  UserPayload,
  UserResponse,
  UsersResponse,
} from '@/types/user'

export const userService = {
  getAll: (params?: ListQueryParams) =>
    apiRequest<UsersResponse>(withQueryParams('/users', params)),

  getById: (id: string) => apiRequest<UserResponse>(`/users/${id}`),

  create: (payload: UserPayload) =>
    apiRequest<UserResponse>('/users', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: UserPayload) =>
    apiRequest<UserResponse>(`/users/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),
}
