export const ENQUIRY_STATUSES = [
  'interested',
  'not_interested',
  'yet_to_decide',
  'see_in_future',
] as const

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]

export interface EnquiryLeadRef {
  id: string
  name: string
  number: string
  whatsappNumber: string
}

export interface EnquiryBranchRef {
  id: string
  name: string
  code: string
}

export interface EnquiryCourseRef {
  id: string
  name: string
  category: string
}

export interface EnquiryUserRef {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export interface Enquiry {
  id: string
  leadId: string
  courseId: string
  branchId: string
  assignedTo: string
  lead: EnquiryLeadRef | null
  course: EnquiryCourseRef | null
  branch: EnquiryBranchRef | null
  assignedUser: EnquiryUserRef | null
  enquiryDate: string
  status: EnquiryStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export interface EnquiriesResponse {
  success: boolean
  data: {
    enquiries: Enquiry[]
    count: number
  }
}

export interface EnquiryResponse {
  success: boolean
  message?: string
  data: {
    enquiry: Enquiry
  }
}

export interface EnquiryPayload {
  leadId: string
  courseId: string
  branchId: string
  assignedTo: string
  enquiryDate: string
  status: EnquiryStatus
  notes?: string
}
