import { apiRequest } from '@/lib/api'
import { withQueryParams } from '@/lib/query'
import type { ListQueryParams } from '@/types/user'
import type {
  AdmissionPayload,
  AdmissionResponse,
  AdmissionsResponse,
} from '@/types/admission'

export const admissionService = {
  getAll: (params?: ListQueryParams) =>
    apiRequest<AdmissionsResponse>(withQueryParams('/admissions', params)),

  getById: (id: string) => apiRequest<AdmissionResponse>(`/admissions/${id}`),

  create: (payload: AdmissionPayload) =>
    apiRequest<AdmissionResponse>('/admissions', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: AdmissionPayload) =>
    apiRequest<AdmissionResponse>(`/admissions/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/admissions/${id}`, {
      method: 'DELETE',
    }),
}
