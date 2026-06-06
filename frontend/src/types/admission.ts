export const ADMISSION_STATUSES = [
  'pending',
  'confirmed',
  'active',
  'cancelled',
] as const

export type AdmissionStatus = (typeof ADMISSION_STATUSES)[number]

export interface AdmissionLeadRef {
  id: string
  name: string
  number: string
  whatsappNumber: string
}

export interface AdmissionBranchRef {
  id: string
  name: string
  code: string
}

export interface AdmissionCourseRef {
  id: string
  name: string
  category: string
}

export interface AdmissionBatchRef {
  id: string
  name: string
  startDate: string
  endDate: string
}

export interface AdmissionStudentRef {
  id: string
  fullName: string
  mobile: string
  email: string
  qualification: string
  isActive: boolean
}

export interface Admission {
  id: string
  enquiryId: string
  leadId: string
  courseId: string
  branchId: string
  batchId: string
  studentId: string
  lead: AdmissionLeadRef | null
  course: AdmissionCourseRef | null
  branch: AdmissionBranchRef | null
  batch: AdmissionBatchRef | null
  student: AdmissionStudentRef | null
  admissionDate: string
  totalFee: number
  discount: number
  netFee: number
  status: AdmissionStatus
  createdAt: string
  updatedAt: string
}

export interface AdmissionsResponse {
  success: boolean
  data: {
    admissions: Admission[]
    count: number
  }
}

export interface AdmissionResponse {
  success: boolean
  message?: string
  data: {
    admission: Admission
  }
}

export interface AdmissionPayload {
  enquiryId: string
  leadId: string
  courseId: string
  branchId: string
  batchId: string
  admissionDate: string
  totalFee: number
  discount: number
  status: AdmissionStatus
  email?: string
  qualification?: string
}
