import { apiRequest } from '@/lib/api'
import { withQueryParams } from '@/lib/query'
import type {
  AdminResponse,
  AdminsResponse,
  UpdateAdminPayload,
} from '@/types/admin'

export const adminService = {
  getAll: (params?: { search?: string; isActive?: string }) =>
    apiRequest<AdminsResponse>(withQueryParams('/admins', params ?? {})),

  update: (id: string, payload: UpdateAdminPayload) =>
    apiRequest<AdminResponse>(`/admins/${id}`, {
      method: 'PATCH',
      body: payload,
    }),
}
