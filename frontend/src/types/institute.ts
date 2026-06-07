export interface Institute {
  id: string
  name: string
  email: string
  phone: string
  address: string
  logo: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface InstitutesResponse {
  success: boolean
  data: {
    institutes: Institute[]
    count: number
  }
}

export interface InstituteResponse {
  success: boolean
  message?: string
  data: {
    institute: Institute
  }
}

export interface ActiveInstituteResponse {
  success: boolean
  data: {
    institute: Institute | null
  }
}

export interface InstitutePayload {
  name: string
  email: string
  phone: string
  address: string
  isActive: boolean
  logoFile?: File | null
}
