export type BranchStatus = 'active' | 'inactive'

export interface Branch {
  id: string
  instituteId: string
  name: string
  code: string
  address: string
  city: string
  state: string
  status: BranchStatus
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface BranchesResponse {
  success: boolean
  data: {
    branches: Branch[]
    count: number
  }
}

export interface BranchResponse {
  success: boolean
  message?: string
  data: {
    branch: Branch
  }
}

export interface BranchQueryParams {
  instituteId?: string
  branchId?: string
}

export interface BranchPayload {
  instituteId?: string
  name: string
  code: string
  address: string
  city: string
  state: string
  status: BranchStatus
}
