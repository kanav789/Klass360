export const FEE_STATUSES = ['pending', 'partial', 'paid'] as const

export type FeeStatus = (typeof FEE_STATUSES)[number]

export interface FeeAdmissionLeadRef {
  id: string
  name: string
  number: string
}

export interface FeeAdmissionStudentRef {
  id: string
  fullName: string
  mobile: string
}

export interface FeeAdmissionCourseRef {
  id: string
  name: string
}

export interface FeeAdmissionBranchRef {
  id: string
  name: string
}

export interface FeeAdmissionRef {
  id: string
  admissionDate: string
  totalFee: number
  discount: number
  netFee: number
  status: string
  lead: FeeAdmissionLeadRef | null
  student: FeeAdmissionStudentRef | null
  course: FeeAdmissionCourseRef | null
  branch: FeeAdmissionBranchRef | null
}

export interface Fee {
  id: string
  admissionId: string
  discount: number
  netFee: number
  paidAmount: number
  pendingAmount: number
  status: FeeStatus
  admission: FeeAdmissionRef | null
  createdAt: string
  updatedAt: string
}

export interface FeesResponse {
  success: boolean
  data: {
    fees: Fee[]
    count: number
  }
}

export interface FeeResponse {
  success: boolean
  message?: string
  data: {
    fee: Fee
  }
}

export interface FeePayload {
  admissionId: string
  paidAmount: number
}
