import { apiRequest } from '@/lib/api'
import { withQueryParams } from '@/lib/query'
import type {
  BranchPayload,
  BranchQueryParams,
  BranchResponse,
  BranchesResponse,
} from '@/types/branch'

export const branchService = {
  getAll: (params?: BranchQueryParams) =>
    apiRequest<BranchesResponse>(withQueryParams('/branches', params)),

  getById: (id: string) => apiRequest<BranchResponse>(`/branches/${id}`),

  create: (payload: BranchPayload) =>
    apiRequest<BranchResponse>('/branches', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: BranchPayload) =>
    apiRequest<BranchResponse>(`/branches/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/branches/${id}`, {
      method: 'DELETE',
    }),
}
