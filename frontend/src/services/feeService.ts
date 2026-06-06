import { apiRequest } from '@/lib/api'
import type { FeePayload, FeeResponse, FeesResponse } from '@/types/fee'

export const feeService = {
  getAll: () => apiRequest<FeesResponse>('/fees'),

  getById: (id: string) => apiRequest<FeeResponse>(`/fees/${id}`),

  create: (payload: FeePayload) =>
    apiRequest<FeeResponse>('/fees', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: FeePayload) =>
    apiRequest<FeeResponse>(`/fees/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/fees/${id}`, {
      method: 'DELETE',
    }),
}
