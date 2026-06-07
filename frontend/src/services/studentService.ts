import { apiRequest } from '@/lib/api'
import { withQueryParams } from '@/lib/query'
import type { ListQueryParams } from '@/types/user'
import type { StudentResponse, StudentsResponse } from '@/types/student'

export const studentService = {
  getAll: (params?: ListQueryParams) =>
    apiRequest<StudentsResponse>(withQueryParams('/students', params)),

  getById: (id: string) => apiRequest<StudentResponse>(`/students/${id}`),
}
