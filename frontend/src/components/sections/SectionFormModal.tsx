import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Branch } from '@/types/branch'
import type { Course } from '@/types/course'
import type { Section, SectionPayload } from '@/types/section'

interface SectionFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  section?: Section | null
  courses: Course[]
  branches: Branch[]
  isLoadingOptions: boolean
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (data: SectionPayload) => void
}

export function SectionFormModal({
  open,
  mode,
  section,
  courses,
  branches,
  isLoadingOptions,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: SectionFormModalProps) {
  const [name, setName] = useState('')
  const [courseId, setCourseId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === courseId),
    [courses, courseId],
  )

  const availableBranches = useMemo(() => {
    if (!selectedCourse) return []

    return branches.filter((branch) =>
      selectedCourse.branchIds.includes(branch.id),
    )
  }, [branches, selectedCourse])

  useEffect(() => {
    if (open) {
      setName(section?.name ?? '')
      setCourseId(section?.courseId ?? '')
      setBranchId(section?.branchId ?? '')
      setStartDate(section?.startDate ? section.startDate.slice(0, 10) : '')
      setEndDate(section?.endDate ? section.endDate.slice(0, 10) : '')
      setIsActive(section?.isActive ?? true)
    }
  }, [open, section])

  useEffect(() => {
    if (
      branchId &&
      !availableBranches.some((branch) => branch.id === branchId)
    ) {
      setBranchId('')
    }
  }, [availableBranches, branchId])

  if (!open) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    onSubmit({
      name,
      courseId,
      branchId,
      startDate,
      endDate,
      isActive,
    })
  }

  const selectClassName =
    'flex h-12 w-full rounded-[var(--radius-input)] border border-border bg-input px-4 text-sm text-primary transition-all duration-200 focus:border-lime focus:bg-card focus:outline-none focus:ring-2 focus:ring-lime/20 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] border border-border/60 bg-card p-6 shadow-[var(--shadow-card-hover)]">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {mode === 'create' ? 'Create Section' : 'Edit Section'}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Link a course to a branch with a schedule and status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-background hover:text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="section-name">
              Section Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="section-name"
              placeholder="e.g. Morning Batch 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="section-course">
                Course <span className="text-danger">*</span>
              </Label>
              {isLoadingOptions ? (
                <div className="flex h-12 items-center gap-2 rounded-[var(--radius-input)] border border-border bg-input px-4 text-sm text-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading courses...
                </div>
              ) : (
                <select
                  id="section-course"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  disabled={isSubmitting || courses.length === 0}
                  className={selectClassName}
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="section-branch">
                Branch <span className="text-danger">*</span>
              </Label>
              <select
                id="section-branch"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
                disabled={
                  isSubmitting || !courseId || availableBranches.length === 0
                }
                className={selectClassName}
              >
                <option value="">
                  {courseId ? 'Select branch' : 'Select course first'}
                </option>
                {availableBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="section-start-date">
                Start Date <span className="text-danger">*</span>
              </Label>
              <Input
                id="section-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section-end-date">
                End Date <span className="text-danger">*</span>
              </Label>
              <Input
                id="section-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate || undefined}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-status">Status</Label>
            <select
              id="section-status"
              value={isActive ? 'active' : 'inactive'}
              onChange={(e) => setIsActive(e.target.value === 'active')}
              disabled={isSubmitting}
              className={selectClassName}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                isSubmitting ||
                !courseId ||
                !branchId ||
                courses.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Section'
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
