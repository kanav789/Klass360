import { apiRequest } from '@/lib/api'
import { withQueryParams } from '@/lib/query'
import type { ListQueryParams } from '@/types/user'
import type {
  EnquiryPayload,
  EnquiryResponse,
  EnquiriesResponse,
} from '@/types/enquiry'

export const enquiryService = {
  getAll: (params?: ListQueryParams) =>
    apiRequest<EnquiriesResponse>(withQueryParams('/enquiries', params)),

  getById: (id: string) => apiRequest<EnquiryResponse>(`/enquiries/${id}`),

  create: (payload: EnquiryPayload) =>
    apiRequest<EnquiryResponse>('/enquiries', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: EnquiryPayload) =>
    apiRequest<EnquiryResponse>(`/enquiries/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/enquiries/${id}`, {
      method: 'DELETE',
    }),
}
