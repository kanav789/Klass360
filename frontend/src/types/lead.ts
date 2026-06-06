export const LEAD_SOURCES = [
  'referral',
  'website',
  'walkin',
  'offline_campaign',
] as const

export type LeadSource = (typeof LEAD_SOURCES)[number]

export interface LeadBranchRef {
  id: string
  name: string
  code: string
}

export interface LeadCourseRef {
  id: string
  name: string
  category: string
}

export interface LeadUserRef {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export interface Lead {
  id: string
  name: string
  number: string
  whatsappNumber: string
  alternateNumber: string
  branchId: string
  courseId: string
  assignedTo: string
  branch: LeadBranchRef | null
  course: LeadCourseRef | null
  assignedUser: LeadUserRef | null
  source: LeadSource
  createdAt: string
  updatedAt: string
}

export interface LeadsResponse {
  success: boolean
  data: {
    leads: Lead[]
    count: number
  }
}

export interface LeadResponse {
  success: boolean
  message?: string
  data: {
    lead: Lead
  }
}

export interface LeadCreatePayload {
  name: string
  number: string
  whatsappNumber: string
  alternateNumber?: string
  branchId: string
  courseId: string
  source: LeadSource
  assignedTo: string
}

export interface LeadUpdatePayload {
  name: string
  whatsappNumber: string
  alternateNumber?: string
  branchId: string
  courseId: string
  source: LeadSource
  assignedTo: string
}
