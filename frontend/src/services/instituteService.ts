import { apiFormRequest, apiRequest } from '@/lib/api'
import type {
  ActiveInstituteResponse,
  InstitutePayload,
  InstituteResponse,
  InstitutesResponse,
} from '@/types/institute'

const buildFormData = (payload: InstitutePayload) => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('email', payload.email)
  formData.append('phone', payload.phone)
  formData.append('address', payload.address)
  formData.append('isActive', String(payload.isActive))

  if (payload.logoFile) {
    formData.append('logo', payload.logoFile)
  }

  return formData
}

export const instituteService = {
  getAll: () => apiRequest<InstitutesResponse>('/institutes'),

  getActive: () => apiRequest<ActiveInstituteResponse>('/institutes/active'),

  getById: (id: string) => apiRequest<InstituteResponse>(`/institutes/${id}`),

  create: (payload: InstitutePayload) =>
    apiFormRequest<InstituteResponse>('/institutes', buildFormData(payload), {
      method: 'POST',
    }),

  update: (id: string, payload: InstitutePayload) =>
    apiFormRequest<InstituteResponse>(
      `/institutes/${id}`,
      buildFormData(payload),
      { method: 'PUT' },
    ),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/institutes/${id}`, {
      method: 'DELETE',
    }),
}
