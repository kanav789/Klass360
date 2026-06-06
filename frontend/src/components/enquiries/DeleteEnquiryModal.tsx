import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Enquiry } from '@/types/enquiry'

interface DeleteEnquiryModalProps {
  enquiry: Enquiry | null
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteEnquiryModal({
  enquiry,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteEnquiryModalProps) {
  if (!enquiry) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative w-full max-w-md rounded-[var(--radius-card)] border border-border/60 bg-card p-6 shadow-[var(--shadow-card-hover)]">
        <h2 className="text-xl font-bold text-primary">Delete Enquiry</h2>
        <p className="mt-3 text-sm leading-relaxed text-secondary">
          Are you sure you want to delete the enquiry for{' '}
          <span className="font-semibold text-primary">
            {enquiry.lead?.name ?? 'this lead'}
          </span>
          ? This action cannot be undone.
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
              'Delete Enquiry'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
