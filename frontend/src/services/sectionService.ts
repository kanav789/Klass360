import { apiRequest } from '@/lib/api'
import { withQueryParams } from '@/lib/query'
import type { ListQueryParams } from '@/types/user'
import type {
  SectionPayload,
  SectionResponse,
  SectionsResponse,
} from '@/types/section'

export const sectionService = {
  getAll: (params?: ListQueryParams) =>
    apiRequest<SectionsResponse>(withQueryParams('/sections', params)),

  getById: (id: string) => apiRequest<SectionResponse>(`/sections/${id}`),

  create: (payload: SectionPayload) =>
    apiRequest<SectionResponse>('/sections', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: SectionPayload) =>
    apiRequest<SectionResponse>(`/sections/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  activate: (id: string) =>
    apiRequest<SectionResponse>(`/sections/${id}/activate`, {
      method: 'PATCH',
    }),

  deactivate: (id: string) =>
    apiRequest<SectionResponse>(`/sections/${id}/deactivate`, {
      method: 'PATCH',
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/sections/${id}`, {
      method: 'DELETE',
    }),
}
