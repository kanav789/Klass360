import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Admission } from '@/types/admission'
import type { Fee, FeePayload, FeeStatus } from '@/types/fee'

interface FeeFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  fee?: Fee | null
  admissions: Admission[]
  existingAdmissionIds: string[]
  isLoadingOptions: boolean
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (data: FeePayload) => void
}

const statusLabels: Record<FeeStatus, string> = {
  pending: 'Pending',
  partial: 'Partial',
  paid: 'Paid',
}

const statusColors: Record<FeeStatus, string> = {
  pending: 'bg-warning/10 text-warning',
  partial: 'bg-secondary/10 text-secondary',
  paid: 'bg-success/10 text-success',
}

function formatCurrency(amount: number) {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getComputedStatus(
  paidAmount: number,
  netFee: number,
): FeeStatus {
  if (paidAmount <= 0) return 'pending'
  if (paidAmount < netFee) return 'partial'
  return 'paid'
}

export function FeeFormModal({
  open,
  mode,
  fee,
  admissions,
  existingAdmissionIds,
  isLoadingOptions,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: FeeFormModalProps) {
  const [admissionId, setAdmissionId] = useState('')
  const [paidAmount, setPaidAmount] = useState('0')

  const availableAdmissions = useMemo(() => {
    if (mode === 'edit' && fee) {
      return admissions.filter(
        (admission) =>
          admission.id === fee.admissionId ||
          !existingAdmissionIds.includes(admission.id),
      )
    }

    return admissions.filter(
      (admission) => !existingAdmissionIds.includes(admission.id),
    )
  }, [admissions, existingAdmissionIds, mode, fee])

  const selectedAdmission = useMemo(
    () => admissions.find((admission) => admission.id === admissionId),
    [admissions, admissionId],
  )

  const discount = selectedAdmission?.discount ?? fee?.discount ?? 0
  const netFee = selectedAdmission?.netFee ?? fee?.netFee ?? 0
  const pendingAmount = Math.max(0, netFee - (Number(paidAmount) || 0))
  const computedStatus = getComputedStatus(Number(paidAmount) || 0, netFee)

  const paidExceedsNet =
    Number(paidAmount) >= 0 && Number(paidAmount) > netFee

  useEffect(() => {
    if (open) {
      setAdmissionId(fee?.admissionId ?? '')
      setPaidAmount(fee ? String(fee.paidAmount) : '0')
    }
  }, [open, fee])

  if (!open) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    onSubmit({
      admissionId,
      paidAmount: Number(paidAmount) || 0,
    })
  }

  const studentName =
    selectedAdmission?.student?.fullName ??
    selectedAdmission?.lead?.name ??
    fee?.admission?.student?.fullName ??
    fee?.admission?.lead?.name ??
    'Student'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[var(--radius-card)] border border-border/60 bg-card p-6 shadow-[var(--shadow-card-hover)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {mode === 'create' ? 'Add Fee Record' : 'Edit Fee Record'}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Track fee payments against an admission. Net fee and discount are
              pulled from the selected admission.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-background hover:text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="admissionId">Admission</Label>
            <select
              id="admissionId"
              value={admissionId}
              onChange={(e) => setAdmissionId(e.target.value)}
              required
              disabled={
                isLoadingOptions || isSubmitting || mode === 'edit'
              }
              className="flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-primary outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {isLoadingOptions
                  ? 'Loading admissions...'
                  : 'Select admission'}
              </option>
              {availableAdmissions.map((admission) => (
                <option key={admission.id} value={admission.id}>
                  {admission.student?.fullName ?? admission.lead?.name ?? 'Student'}{' '}
                  — {admission.course?.name ?? 'Course'} (
                  {admission.branch?.name ?? 'Branch'})
                </option>
              ))}
            </select>
          </div>

          {admissionId && (
            <div className="rounded-xl border border-border/60 bg-background p-4 text-sm">
              <p className="font-semibold text-primary">{studentName}</p>
              <p className="mt-1 text-secondary">
                {selectedAdmission?.course?.name ?? fee?.admission?.course?.name}{' '}
                · {selectedAdmission?.branch?.name ?? fee?.admission?.branch?.name}
              </p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Discount (₹)</Label>
              <div className="flex h-11 items-center rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-secondary">
                {formatCurrency(discount)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Net Fee (₹)</Label>
              <div className="flex h-11 items-center rounded-xl border border-border/60 bg-background px-4 text-sm font-semibold text-primary">
                {formatCurrency(netFee)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidAmount">Paid Amount (₹)</Label>
              <Input
                id="paidAmount"
                type="number"
                min="0"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                required
                disabled={isSubmitting || !admissionId}
                placeholder="0.00"
              />
              {paidExceedsNet && (
                <p className="text-xs text-danger">
                  Paid amount cannot exceed net fee
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pending Amount (₹)</Label>
              <div className="flex h-11 items-center rounded-xl border border-border/60 bg-background px-4 text-sm font-semibold text-primary">
                {formatCurrency(pendingAmount)}
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Status</Label>
              <div className="flex h-11 items-center rounded-xl border border-border/60 bg-background px-4">
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                    statusColors[computedStatus],
                  )}
                >
                  {statusLabels[computedStatus]}
                </span>
              </div>
              <p className="text-xs text-secondary">
                Status is calculated automatically from paid vs net fee.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border/60 pt-5">
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
                isLoadingOptions ||
                !admissionId ||
                paidExceedsNet
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Add Fee Record'
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
