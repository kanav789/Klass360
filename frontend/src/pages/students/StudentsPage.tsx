import { useCallback, useEffect, useState } from 'react'
import { GraduationCap, Loader2, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api'
import { studentService } from '@/services/studentService'
import type { Student } from '@/types/student'

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await studentService.getAll()
      setStudents(response.data.students)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load students. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase()

    return (
      student.fullName.toLowerCase().includes(query) ||
      student.mobile.includes(query) ||
      student.whatsappNumber.includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.alternateMobile.includes(query) ||
      student.qualification.toLowerCase().includes(query) ||
      student.branch?.name?.toLowerCase().includes(query) ||
      (student.isActive ? 'active' : 'inactive').includes(query)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-primary">
          <GraduationCap className="h-3.5 w-3.5" />
          Student Directory
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Students
        </h1>
        <p className="mt-2 text-secondary">
          View student profiles created automatically from admissions.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search students..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredStudents.length} student
              {filteredStudents.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-secondary">
              <Loader2 className="h-8 w-8 animate-spin text-lime" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No students match your search' : 'No students yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Students are created automatically when you add an admission.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Full Name</th>
                      <th className="px-5 py-4 font-semibold">Mobile</th>
                      <th className="px-5 py-4 font-semibold">WhatsApp</th>
                      <th className="px-5 py-4 font-semibold">Email</th>
                      <th className="px-5 py-4 font-semibold">Alt. Mobile</th>
                      <th className="px-5 py-4 font-semibold">Qualification</th>
                      <th className="px-5 py-4 font-semibold">Branch</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4 font-semibold text-primary">
                          {student.fullName}
                        </td>
                        <td className="px-5 py-4 text-primary">{student.mobile}</td>
                        <td className="px-5 py-4 text-primary">
                          {student.whatsappNumber}
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {student.email || '—'}
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {student.alternateMobile || '—'}
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {student.qualification || '—'}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {student.branch?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4">
                          <ActiveBadge isActive={student.isActive} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
