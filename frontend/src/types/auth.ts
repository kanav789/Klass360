export interface Admin {
  id: string
  fullName: string
  email: string
  role: 'admin'
  lastLoginAt?: string | null
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    token: string
    admin: Admin
  }
}

export interface MeResponse {
  success: boolean
  data: {
    admin: Admin
  }
}

export interface ApiErrorResponse {
  success: false
  message: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
}
