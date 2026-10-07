import type { AdminRole } from './auth'

export interface AdminAccount {
  id: string
  fullName: string
  email: string
  role: AdminRole
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
  instituteCount?: number
}

export interface AdminsResponse {
  success: boolean
  message: string
  data: {
    admins: AdminAccount[]
    count: number
  }
}

export interface AdminResponse {
  success: boolean
  message: string
  data: {
    admin: AdminAccount
  }
}

export interface UpdateAdminPayload {
  isActive?: boolean
}
