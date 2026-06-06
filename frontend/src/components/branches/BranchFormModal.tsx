import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Branch } from '@/types/branch'

interface BranchFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  branch?: Branch | null
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (data: { name: string; address: string }) => void
}

export function BranchFormModal({
  open,
  mode,
  branch,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: BranchFormModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (open) {
      setName(branch?.name ?? '')
      setAddress(branch?.address ?? '')
    }
  }, [open, branch])

  if (!open) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ name, address })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative w-full max-w-lg rounded-[var(--radius-card)] border border-border/60 bg-card p-6 shadow-[var(--shadow-card-hover)]">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {mode === 'create' ? 'Create Branch' : 'Edit Branch'}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              {mode === 'create'
                ? 'Add a new institute branch with name and address.'
                : 'Update the branch entity name and address.'}
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
            <Label htmlFor="branch-name">Entity Name</Label>
            <Input
              id="branch-name"
              placeholder="e.g. Klass360 Delhi Campus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-address">Address</Label>
            <Textarea
              id="branch-address"
              placeholder="Enter full branch address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={isSubmitting}
            />
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
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Branch'
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
