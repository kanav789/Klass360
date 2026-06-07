import { apiRequest } from '@/lib/api'
import { withQueryParams } from '@/lib/query'
import type { ListQueryParams } from '@/types/user'
import type {
  LeadCreatePayload,
  LeadResponse,
  LeadsResponse,
  LeadUpdatePayload,
} from '@/types/lead'

export const leadService = {
  getAll: (params?: ListQueryParams) =>
    apiRequest<LeadsResponse>(withQueryParams('/leads', params)),

  getById: (id: string) => apiRequest<LeadResponse>(`/leads/${id}`),

  create: (payload: LeadCreatePayload) =>
    apiRequest<LeadResponse>('/leads', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: LeadUpdatePayload) =>
    apiRequest<LeadResponse>(`/leads/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/leads/${id}`, {
      method: 'DELETE',
    }),
}
