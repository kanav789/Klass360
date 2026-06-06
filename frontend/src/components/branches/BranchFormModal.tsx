import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Branch, BranchPayload, BranchStatus } from '@/types/branch'

interface BranchFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  branch?: Branch | null
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (data: BranchPayload) => void
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
  const [code, setCode] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [status, setStatus] = useState<BranchStatus>('active')

  useEffect(() => {
    if (open) {
      setName(branch?.name ?? '')
      setCode(branch?.code ?? '')
      setAddress(branch?.address ?? '')
      setCity(branch?.city ?? '')
      setState(branch?.state ?? '')
      setStatus(branch?.status ?? 'active')
    }
  }, [open, branch])

  if (!open) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({
      name,
      code: code.toUpperCase(),
      address,
      city,
      state,
      status,
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
              {mode === 'create' ? 'Create Branch' : 'Edit Branch'}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              {mode === 'create'
                ? 'Add a new institute branch with location details.'
                : 'Update branch information and status.'}
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
              <Label htmlFor="branch-name">
                Branch Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="branch-name"
                placeholder="e.g. Delhi Campus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-code">
                Branch Code <span className="text-danger">*</span>
              </Label>
              <Input
                id="branch-code"
                placeholder="e.g. DEL-01"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-address">
              Address <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="branch-address"
              placeholder="Enter full branch address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="branch-city">
                City <span className="text-danger">*</span>
              </Label>
              <Input
                id="branch-city"
                placeholder="e.g. New Delhi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-state">
                State <span className="text-danger">*</span>
              </Label>
              <Input
                id="branch-state"
                placeholder="e.g. Delhi"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-status">Status</Label>
            <select
              id="branch-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BranchStatus)}
              disabled={isSubmitting}
              className="flex h-12 w-full rounded-[var(--radius-input)] border border-border bg-input px-4 text-sm text-primary transition-all duration-200 focus:border-lime focus:bg-card focus:outline-none focus:ring-2 focus:ring-lime/20 disabled:cursor-not-allowed disabled:opacity-50"
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
