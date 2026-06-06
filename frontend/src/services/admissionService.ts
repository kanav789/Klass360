import { apiRequest } from '@/lib/api'
import type {
  AdmissionPayload,
  AdmissionResponse,
  AdmissionsResponse,
} from '@/types/admission'

export const admissionService = {
  getAll: () => apiRequest<AdmissionsResponse>('/admissions'),

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
