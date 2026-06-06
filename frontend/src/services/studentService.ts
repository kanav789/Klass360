import { apiRequest } from '@/lib/api'
import type { StudentResponse, StudentsResponse } from '@/types/student'

export const studentService = {
  getAll: () => apiRequest<StudentsResponse>('/students'),

  getById: (id: string) => apiRequest<StudentResponse>(`/students/${id}`),
}
