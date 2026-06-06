import { apiRequest } from '@/lib/api'
import type {
  BranchPayload,
  BranchResponse,
  BranchesResponse,
} from '@/types/branch'

export const branchService = {
  getAll: () => apiRequest<BranchesResponse>('/branches'),

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
