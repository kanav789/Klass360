export const USER_ROLES = [
  'admin',
  'manager',
  'counselor',
  'teacher',
  'accountant',
  'receptionist',
] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface User {
  id: string
  firstName: string
  lastName: string
  mobile: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UsersResponse {
  success: boolean
  data: {
    users: User[]
    count: number
  }
}

export interface UserResponse {
  success: boolean
  message?: string
  data: {
    user: User
  }
}

export interface UserPayload {
  firstName: string
  lastName: string
  mobile: string
  email: string
  role: UserRole
}
