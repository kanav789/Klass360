export interface Branch {
  id: string
  name: string
  address: string
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

export interface BranchPayload {
  name: string
  address: string
}
