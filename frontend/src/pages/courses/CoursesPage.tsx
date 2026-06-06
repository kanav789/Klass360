import { useCallback, useEffect, useState } from 'react'
import {
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Trash2,
} from 'lucide-react'
import { CourseFormModal } from '@/components/courses/CourseFormModal'
import { DeleteCourseModal } from '@/components/courses/DeleteCourseModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api'
import { branchService } from '@/services/branchService'
import { courseService } from '@/services/courseService'
import type { Branch } from '@/types/branch'
import type { Course, CoursePayload } from '@/types/course'

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        isActive ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary',
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await courseService.getAll()
      setCourses(response.data.courses)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load courses. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchBranches = useCallback(async () => {
    setIsLoadingBranches(true)

    try {
      const response = await branchService.getAll()
      setBranches(response.data.branches.filter((branch) => branch.status === 'active'))
    } catch {
      setBranches([])
    } finally {
      setIsLoadingBranches(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
    fetchBranches()
  }, [fetchCourses, fetchBranches])

  const filteredCourses = courses.filter((course) => {
    const query = search.toLowerCase()
    const branchText = course.branches
      .map((branch) => `${branch.name} ${branch.code}`)
      .join(' ')
      .toLowerCase()

    return (
      course.name.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      branchText.includes(query) ||
      (course.isActive ? 'active' : 'inactive').includes(query)
    )
  })

  const openCreateModal = () => {
    setFormMode('create')
    setSelectedCourse(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEditModal = (course: Course) => {
    setFormMode('edit')
    setSelectedCourse(course)
    setFormError('')
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: CoursePayload) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        await courseService.create(data)
      } else if (selectedCourse) {
        await courseService.update(selectedCourse.id, data)
      }

      setFormOpen(false)
      await fetchCourses()
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Failed to save course. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await courseService.delete(deleteTarget.id)
      setDeleteTarget(null)
      await fetchCourses()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to delete course. Please try again.',
      )
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async (course: Course) => {
    setStatusUpdatingId(course.id)
    setError('')

    try {
      if (course.isActive) {
        await courseService.deactivate(course.id)
      } else {
        await courseService.activate(course.id)
      }

      await fetchCourses()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to update course status. Please try again.',
      )
    } finally {
      setStatusUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            Course Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Courses
          </h1>
          <p className="mt-2 text-secondary">
            Create and manage courses across institute branches.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={openCreateModal}>
          <Plus className="h-5 w-5" />
          Add Course
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search courses..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredCourses.length} course
              {filteredCourses.length !== 1 ? 's' : ''} found
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
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No courses match your search' : 'No courses yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Create your first course to get started.'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4" />
                  Add Course
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Course Name</th>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 font-semibold">Duration</th>
                      <th className="px-5 py-4 font-semibold">Branches</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr
                        key={course.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-primary">
                              {course.name}
                            </p>
                            {course.description && (
                              <p className="mt-1 line-clamp-1 max-w-xs text-xs text-secondary">
                                {course.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {course.category}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {course.durationInMonths} months
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {course.branches.map((branch) => (
                              <span
                                key={branch.id}
                                className="rounded-lg bg-background px-2 py-1 text-xs font-medium text-primary"
                              >
                                {branch.code}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge isActive={course.isActive} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(course)}
                              disabled={statusUpdatingId === course.id}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary disabled:opacity-50"
                              aria-label={
                                course.isActive
                                  ? `Deactivate ${course.name}`
                                  : `Activate ${course.name}`
                              }
                              title={
                                course.isActive ? 'Deactivate' : 'Activate'
                              }
                            >
                              {statusUpdatingId === course.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : course.isActive ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(course)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary"
                              aria-label={`Edit ${course.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(course)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                              aria-label={`Delete ${course.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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

      <CourseFormModal
        open={formOpen}
        mode={formMode}
        course={selectedCourse}
        branches={branches}
        isLoadingBranches={isLoadingBranches}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteCourseModal
        course={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
