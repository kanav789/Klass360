import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Course } from '@/types/course'

interface DeleteCourseModalProps {
  course: Course | null
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteCourseModal({
  course,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteCourseModalProps) {
  if (!course) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative w-full max-w-md rounded-[var(--radius-card)] border border-border/60 bg-card p-6 shadow-[var(--shadow-card-hover)]">
        <h2 className="text-xl font-bold text-primary">Delete Course</h2>
        <p className="mt-3 text-sm leading-relaxed text-secondary">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-primary">{course.name}</span>?
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-danger text-white hover:bg-danger/90"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Course'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
