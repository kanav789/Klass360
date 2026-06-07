import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ClipboardCheck,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { AdmissionFormModal } from '@/components/admissions/AdmissionFormModal'
import { DeleteAdmissionModal } from '@/components/admissions/DeleteAdmissionModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useBranchFilter } from '@/context/BranchFilterContext'
import { useBranchQuery } from '@/hooks/useBranchQuery'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api'
import { admissionService } from '@/services/admissionService'
import { courseService } from '@/services/courseService'
import { enquiryService } from '@/services/enquiryService'
import { sectionService } from '@/services/sectionService'
import type { Admission, AdmissionPayload, AdmissionStatus } from '@/types/admission'
import type { Course } from '@/types/course'
import type { Enquiry } from '@/types/enquiry'
import type { Section } from '@/types/section'

const statusLabels: Record<AdmissionStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  active: 'Active',
  cancelled: 'Cancelled',
}

function StatusBadge({ status }: { status: AdmissionStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        status === 'pending' && 'bg-warning/10 text-warning',
        status === 'confirmed' && 'bg-secondary/10 text-secondary',
        status === 'active' && 'bg-success/10 text-success',
        status === 'cancelled' && 'bg-danger/10 text-danger',
      )}
    >
      {statusLabels[status]}
    </span>
  )
}

function formatDisplayDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  })
}

export function AdmissionsPage() {
  const branchQuery = useBranchQuery()
  const { selectedBranchId, branches: filterBranches } = useBranchFilter()
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(
    null,
  )
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Admission | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const existingEnquiryIds = useMemo(
    () =>
      admissions
        .filter((admission) => admission.id !== selectedAdmission?.id)
        .map((admission) => admission.enquiryId),
    [admissions, selectedAdmission],
  )

  const fetchAdmissions = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await admissionService.getAll(branchQuery)
      setAdmissions(response.data.admissions)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load admissions. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [branchQuery])

  const fetchOptions = useCallback(async () => {
    setIsLoadingOptions(true)

    try {
      const [enquiriesResponse, coursesResponse, sectionsResponse] =
        await Promise.all([
          enquiryService.getAll(branchQuery),
          courseService.getAll(branchQuery),
          sectionService.getAll(branchQuery),
        ])

      setEnquiries(enquiriesResponse.data.enquiries)
      setCourses(
        coursesResponse.data.courses.filter((course) => course.isActive),
      )
      setSections(sectionsResponse.data.sections)
    } catch {
      setEnquiries([])
      setCourses([])
      setSections([])
    } finally {
      setIsLoadingOptions(false)
    }
  }, [branchQuery])

  useEffect(() => {
    fetchAdmissions()
    fetchOptions()
  }, [fetchAdmissions, fetchOptions])

  const filteredAdmissions = admissions.filter((admission) => {
    const query = search.toLowerCase()

    return (
      admission.lead?.name?.toLowerCase().includes(query) ||
      admission.lead?.number?.includes(query) ||
      admission.branch?.name?.toLowerCase().includes(query) ||
      admission.course?.name?.toLowerCase().includes(query) ||
      admission.batch?.name?.toLowerCase().includes(query) ||
      admission.student?.fullName?.toLowerCase().includes(query) ||
      statusLabels[admission.status].toLowerCase().includes(query)
    )
  })

  const openCreateModal = () => {
    setFormMode('create')
    setSelectedAdmission(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEditModal = (admission: Admission) => {
    setFormMode('edit')
    setSelectedAdmission(admission)
    setFormError('')
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: AdmissionPayload) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        await admissionService.create(data)
      } else if (selectedAdmission) {
        await admissionService.update(selectedAdmission.id, data)
      }

      setFormOpen(false)
      await fetchAdmissions()
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Failed to save admission. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await admissionService.delete(deleteTarget.id)
      setDeleteTarget(null)
      await fetchAdmissions()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to delete admission. Please try again.',
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
            <ClipboardCheck className="h-3.5 w-3.5" />
            Admission Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Admissions
          </h1>
          <p className="mt-2 text-secondary">
            Convert enquiries into admissions and auto-create student profiles.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={openCreateModal}>
          <Plus className="h-5 w-5" />
          Add Admission
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search admissions..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredAdmissions.length} admission
              {filteredAdmissions.length !== 1 ? 's' : ''} found
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
          ) : filteredAdmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <ClipboardCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No admissions match your search' : 'No admissions yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Create your first admission from an existing enquiry.'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4" />
                  Add Admission
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1300px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Student</th>
                      <th className="px-5 py-4 font-semibold">Branch</th>
                      <th className="px-5 py-4 font-semibold">Course</th>
                      <th className="px-5 py-4 font-semibold">Batch</th>
                      <th className="px-5 py-4 font-semibold">Date</th>
                      <th className="px-5 py-4 font-semibold">Total Fee</th>
                      <th className="px-5 py-4 font-semibold">Discount</th>
                      <th className="px-5 py-4 font-semibold">Net Fee</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmissions.map((admission) => (
                      <tr
                        key={admission.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-primary">
                              {admission.student?.fullName ??
                                admission.lead?.name ??
                                '—'}
                            </p>
                            <p className="text-xs text-secondary">
                              {admission.student?.mobile ??
                                admission.lead?.number ??
                                ''}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {admission.branch?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {admission.course?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {admission.batch?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {formatDisplayDate(admission.admissionDate)}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {formatCurrency(admission.totalFee)}
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {formatCurrency(admission.discount)}
                        </td>
                        <td className="px-5 py-4 font-semibold text-primary">
                          {formatCurrency(admission.netFee)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={admission.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(admission)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary"
                              aria-label={`Edit admission for ${admission.lead?.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(admission)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                              aria-label={`Delete admission for ${admission.lead?.name}`}
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

      <AdmissionFormModal
        open={formOpen}
        mode={formMode}
        admission={selectedAdmission}
        enquiries={enquiries}
        branches={filterBranches}
        courses={courses}
        sections={sections}
        existingEnquiryIds={existingEnquiryIds}
        lockedBranchId={selectedBranchId || undefined}
        isLoadingOptions={isLoadingOptions}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteAdmissionModal
        admission={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
