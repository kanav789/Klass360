import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Branch } from '@/types/branch'
import type { Course, CoursePayload } from '@/types/course'

interface CourseFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  course?: Course | null
  branches: Branch[]
  isLoadingBranches: boolean
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (data: CoursePayload) => void
}

export function CourseFormModal({
  open,
  mode,
  course,
  branches,
  isLoadingBranches,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: CourseFormModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [durationInMonths, setDurationInMonths] = useState('12')
  const [description, setDescription] = useState('')
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (open) {
      setName(course?.name ?? '')
      setCategory(course?.category ?? '')
      setDurationInMonths(String(course?.durationInMonths ?? 12))
      setDescription(course?.description ?? '')
      setSelectedBranchIds(course?.branchIds ?? [])
      setIsActive(course?.isActive ?? true)
    }
  }, [open, course])

  if (!open) return null

  const toggleBranch = (branchId: string, checked: boolean) => {
    setSelectedBranchIds((current) =>
      checked
        ? [...current, branchId]
        : current.filter((id) => id !== branchId),
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (selectedBranchIds.length === 0) {
      return
    }

    onSubmit({
      name,
      category,
      durationInMonths: Number(durationInMonths),
      description,
      branchIds: selectedBranchIds,
      isActive,
    })
  }

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
              {mode === 'create' ? 'Create Course' : 'Edit Course'}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Define course details and assign it to one or more branches.
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

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course-name">
                Course Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="course-name"
                placeholder="e.g. B.Tech Computer Science"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-category">
                Category <span className="text-danger">*</span>
              </Label>
              <Input
                id="course-category"
                placeholder="e.g. Engineering"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course-duration">
                Duration (Months) <span className="text-danger">*</span>
              </Label>
              <Input
                id="course-duration"
                type="number"
                min={1}
                max={120}
                value={durationInMonths}
                onChange={(e) => setDurationInMonths(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-status">Status</Label>
              <select
                id="course-status"
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                disabled={isSubmitting}
                className="flex h-12 w-full rounded-[var(--radius-input)] border border-border bg-input px-4 text-sm text-primary transition-all duration-200 focus:border-lime focus:bg-card focus:outline-none focus:ring-2 focus:ring-lime/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              placeholder="Enter course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3">
            <Label>
              Branches <span className="text-danger">*</span>
            </Label>

            {isLoadingBranches ? (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading branches...
              </div>
            ) : branches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-secondary">
                No branches available. Create a branch first.
              </div>
            ) : (
              <div className="grid gap-2 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
                {branches.map((branch) => (
                  <label
                    key={branch.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-card"
                  >
                    <Checkbox
                      checked={selectedBranchIds.includes(branch.id)}
                      onCheckedChange={(checked) =>
                        toggleBranch(branch.id, checked === true)
                      }
                      disabled={isSubmitting}
                    />
                    <span className="text-sm">
                      <span className="font-medium text-primary">
                        {branch.name}
                      </span>
                      <span className="ml-2 font-mono text-xs text-secondary">
                        {branch.code}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {selectedBranchIds.length === 0 && branches.length > 0 && (
              <p className="text-xs text-danger">
                Select at least one branch for this course.
              </p>
            )}
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
                branches.length === 0 ||
                selectedBranchIds.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Course'
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
