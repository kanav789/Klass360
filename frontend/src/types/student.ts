export interface StudentBranchRef {
  id: string
  name: string
  code: string
}

export interface StudentLeadRef {
  id: string
  name: string
  number: string
}

export interface Student {
  id: string
  leadId: string
  admissionId: string
  fullName: string
  mobile: string
  whatsappNumber: string
  email: string
  alternateMobile: string
  qualification: string
  branchId: string
  branch: StudentBranchRef | null
  lead: StudentLeadRef | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StudentsResponse {
  success: boolean
  data: {
    students: Student[]
    count: number
  }
}

export interface StudentResponse {
  success: boolean
  data: {
    student: Student
  }
}
