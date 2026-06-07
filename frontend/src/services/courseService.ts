import { apiRequest } from '@/lib/api'
import { withQueryParams } from '@/lib/query'
import type { ListQueryParams } from '@/types/user'
import type {
  CoursePayload,
  CourseResponse,
  CoursesResponse,
} from '@/types/course'

export const courseService = {
  getAll: (params?: ListQueryParams) =>
    apiRequest<CoursesResponse>(withQueryParams('/courses', params)),

  getById: (id: string) => apiRequest<CourseResponse>(`/courses/${id}`),

  create: (payload: CoursePayload) =>
    apiRequest<CourseResponse>('/courses', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: CoursePayload) =>
    apiRequest<CourseResponse>(`/courses/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  activate: (id: string) =>
    apiRequest<CourseResponse>(`/courses/${id}/activate`, {
      method: 'PATCH',
    }),

  deactivate: (id: string) =>
    apiRequest<CourseResponse>(`/courses/${id}/deactivate`, {
      method: 'PATCH',
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/courses/${id}`, {
      method: 'DELETE',
    }),
}
