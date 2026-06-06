import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react'
import { DeleteFeeModal } from '@/components/fees/DeleteFeeModal'
import { FeeFormModal } from '@/components/fees/FeeFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api'
import { admissionService } from '@/services/admissionService'
import { feeService } from '@/services/feeService'
import type { Admission } from '@/types/admission'
import type { Fee, FeePayload, FeeStatus } from '@/types/fee'

const statusLabels: Record<FeeStatus, string> = {
  pending: 'Pending',
  partial: 'Partial',
  paid: 'Paid',
}

function StatusBadge({ status }: { status: FeeStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        status === 'pending' && 'bg-warning/10 text-warning',
        status === 'partial' && 'bg-secondary/10 text-secondary',
        status === 'paid' && 'bg-success/10 text-success',
      )}
    >
      {statusLabels[status]}
    </span>
  )
}

function formatCurrency(amount: number) {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  })
}

export function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([])
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Fee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const existingAdmissionIds = useMemo(
    () =>
      fees
        .filter((fee) => fee.id !== selectedFee?.id)
        .map((fee) => fee.admissionId),
    [fees, selectedFee],
  )

  const fetchFees = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await feeService.getAll()
      setFees(response.data.fees)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load fee records. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchAdmissions = useCallback(async () => {
    setIsLoadingOptions(true)

    try {
      const response = await admissionService.getAll()
      setAdmissions(response.data.admissions)
    } catch {
      setAdmissions([])
    } finally {
      setIsLoadingOptions(false)
    }
  }, [])

  useEffect(() => {
    fetchFees()
    fetchAdmissions()
  }, [fetchFees, fetchAdmissions])

  const filteredFees = fees.filter((fee) => {
    const query = search.toLowerCase()
    const studentName =
      fee.admission?.student?.fullName ??
      fee.admission?.lead?.name ??
      ''

    return (
      studentName.toLowerCase().includes(query) ||
      fee.admission?.course?.name?.toLowerCase().includes(query) ||
      fee.admission?.branch?.name?.toLowerCase().includes(query) ||
      statusLabels[fee.status].toLowerCase().includes(query) ||
      String(fee.netFee).includes(query) ||
      String(fee.paidAmount).includes(query) ||
      String(fee.pendingAmount).includes(query)
    )
  })

  const openCreateModal = () => {
    setFormMode('create')
    setSelectedFee(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEditModal = (fee: Fee) => {
    setFormMode('edit')
    setSelectedFee(fee)
    setFormError('')
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: FeePayload) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        await feeService.create(data)
      } else if (selectedFee) {
        await feeService.update(selectedFee.id, data)
      }

      setFormOpen(false)
      await fetchFees()
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Failed to save fee record. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await feeService.delete(deleteTarget.id)
      setDeleteTarget(null)
      await fetchFees()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to delete fee record. Please try again.',
      )
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-primary">
            <Wallet className="h-3.5 w-3.5" />
            Fee Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Fees
          </h1>
          <p className="mt-2 text-secondary">
            Track student fee payments linked to admissions.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={openCreateModal}>
          <Plus className="h-5 w-5" />
          Add Fee Record
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search fee records..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredFees.length} record
              {filteredFees.length !== 1 ? 's' : ''} found
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
          ) : filteredFees.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No fee records match your search' : 'No fee records yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Add a fee record for an admission to start tracking payments.'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4" />
                  Add Fee Record
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Student</th>
                      <th className="px-5 py-4 font-semibold">Course</th>
                      <th className="px-5 py-4 font-semibold">Branch</th>
                      <th className="px-5 py-4 font-semibold">Discount</th>
                      <th className="px-5 py-4 font-semibold">Net Fee</th>
                      <th className="px-5 py-4 font-semibold">Paid</th>
                      <th className="px-5 py-4 font-semibold">Pending</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFees.map((fee) => (
                      <tr
                        key={fee.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-primary">
                              {fee.admission?.student?.fullName ??
                                fee.admission?.lead?.name ??
                                '—'}
                            </p>
                            <p className="text-xs text-secondary">
                              {fee.admission?.student?.mobile ??
                                fee.admission?.lead?.number ??
                                ''}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {fee.admission?.course?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {fee.admission?.branch?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {formatCurrency(fee.discount)}
                        </td>
                        <td className="px-5 py-4 font-semibold text-primary">
                          {formatCurrency(fee.netFee)}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {formatCurrency(fee.paidAmount)}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {formatCurrency(fee.pendingAmount)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={fee.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(fee)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary"
                              aria-label="Edit fee record"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(fee)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                              aria-label="Delete fee record"
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

      <FeeFormModal
        open={formOpen}
        mode={formMode}
        fee={selectedFee}
        admissions={admissions}
        existingAdmissionIds={existingAdmissionIds}
        isLoadingOptions={isLoadingOptions}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteFeeModal
        fee={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
