export interface SectionCourseRef {
  id: string
  name: string
  category: string
}

export interface SectionBranchRef {
  id: string
  name: string
  code: string
}

export interface Section {
  id: string
  name: string
  courseId: string
  branchId: string
  course: SectionCourseRef | null
  branch: SectionBranchRef | null
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SectionsResponse {
  success: boolean
  data: {
    sections: Section[]
    count: number
  }
}

export interface SectionResponse {
  success: boolean
  message?: string
  data: {
    section: Section
  }
}

export interface SectionPayload {
  name: string
  courseId: string
  branchId: string
  startDate: string
  endDate: string
  isActive: boolean
}
