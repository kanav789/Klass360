export interface CourseBranchRef {
  id: string
  name: string
  code: string
}

export interface Course {
  id: string
  name: string
  category: string
  durationInMonths: number
  description: string
  branchIds: string[]
  branches: CourseBranchRef[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CoursesResponse {
  success: boolean
  data: {
    courses: Course[]
    count: number
  }
}

export interface CourseResponse {
  success: boolean
  message?: string
  data: {
    course: Course
  }
}

export interface CoursePayload {
  name: string
  category: string
  durationInMonths: number
  description: string
  branchIds: string[]
  isActive: boolean
}
