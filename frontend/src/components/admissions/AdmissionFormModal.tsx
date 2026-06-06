import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Admission, AdmissionPayload, AdmissionStatus } from '@/types/admission'
import { ADMISSION_STATUSES } from '@/types/admission'
import type { Branch } from '@/types/branch'
import type { Course } from '@/types/course'
import type { Enquiry } from '@/types/enquiry'
import type { Section } from '@/types/section'

interface AdmissionFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  admission?: Admission | null
  enquiries: Enquiry[]
  branches: Branch[]
  courses: Course[]
  sections: Section[]
  existingEnquiryIds: string[]
  isLoadingOptions: boolean
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (data: AdmissionPayload) => void
}

const statusLabels: Record<AdmissionStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  active: 'Active',
  cancelled: 'Cancelled',
}

export function AdmissionFormModal({
  open,
  mode,
  admission,
  enquiries,
  branches,
  courses,
  sections,
  existingEnquiryIds,
  isLoadingOptions,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: AdmissionFormModalProps) {
  const [enquiryId, setEnquiryId] = useState('')
  const [leadId, setLeadId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [admissionDate, setAdmissionDate] = useState('')
  const [totalFee, setTotalFee] = useState('')
  const [discount, setDiscount] = useState('0')
  const [status, setStatus] = useState<AdmissionStatus>('pending')
  const [email, setEmail] = useState('')
  const [qualification, setQualification] = useState('')

  const availableEnquiries = useMemo(() => {
    if (mode === 'edit' && admission) {
      return enquiries.filter(
        (enquiry) =>
          enquiry.id === admission.enquiryId ||
          !existingEnquiryIds.includes(enquiry.id),
      )
    }

    return enquiries.filter(
      (enquiry) => !existingEnquiryIds.includes(enquiry.id),
    )
  }, [enquiries, existingEnquiryIds, mode, admission])

  const selectedEnquiry = useMemo(
    () => enquiries.find((enquiry) => enquiry.id === enquiryId),
    [enquiries, enquiryId],
  )

  const availableCourses = useMemo(() => {
    if (!branchId) return []
    return courses.filter((course) => course.branchIds.includes(branchId))
  }, [branchId, courses])

  const availableBatches = useMemo(() => {
    if (!branchId || !courseId) return []
    return sections.filter(
      (section) =>
        section.isActive &&
        section.branchId === branchId &&
        section.courseId === courseId,
    )
  }, [branchId, courseId, sections])

  const netFee = useMemo(() => {
    const total = Number(totalFee) || 0
    const disc = Number(discount) || 0
    return Math.max(0, total - disc)
  }, [totalFee, discount])

  useEffect(() => {
    if (open) {
      setEnquiryId(admission?.enquiryId ?? '')
      setLeadId(admission?.leadId ?? '')
      setBranchId(admission?.branchId ?? '')
      setCourseId(admission?.courseId ?? '')
      setBatchId(admission?.batchId ?? '')
      setAdmissionDate(
        admission?.admissionDate
          ? admission.admissionDate.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      )
      setTotalFee(admission ? String(admission.totalFee) : '')
      setDiscount(admission ? String(admission.discount) : '0')
      setStatus(admission?.status ?? 'pending')
      setEmail(admission?.student?.email ?? '')
      setQualification(admission?.student?.qualification ?? '')
    }
  }, [open, admission])

  useEffect(() => {
    if (mode === 'create' && selectedEnquiry) {
      setLeadId(selectedEnquiry.leadId)
      setBranchId(selectedEnquiry.branchId)
      setCourseId(selectedEnquiry.courseId)
    }
  }, [selectedEnquiry, mode])

  useEffect(() => {
    if (courseId && !availableCourses.some((course) => course.id === courseId)) {
      setCourseId('')
    }
  }, [availableCourses, courseId])

  useEffect(() => {
    if (batchId && !availableBatches.some((batch) => batch.id === batchId)) {
      setBatchId('')
    }
  }, [availableBatches, batchId])

  if (!open) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    onSubmit({
      enquiryId,
      leadId,
      courseId,
      branchId,
      batchId,
      admissionDate,
      totalFee: Number(totalFee),
      discount: Number(discount) || 0,
      status,
      email: email.trim(),
      qualification: qualification.trim(),
    })
  }

  const discountExceedsTotal =
    Number(totalFee) >= 0 &&
    Number(discount) > Number(totalFee)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] border border-border/60 bg-card p-6 shadow-[var(--shadow-card-hover)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {mode === 'create' ? 'Create Admission' : 'Edit Admission'}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              {mode === 'create'
                ? 'Convert an enquiry into an admission. A student profile will be created automatically.'
                : 'Update admission details and fee information.'}
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
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="enquiryId">Enquiry</Label>
              <select
                id="enquiryId"
                value={enquiryId}
                onChange={(e) => setEnquiryId(e.target.value)}
                required
                disabled={isLoadingOptions || isSubmitting}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-primary outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {isLoadingOptions ? 'Loading enquiries...' : 'Select enquiry'}
                </option>
                {availableEnquiries.map((enquiry) => (
                  <option key={enquiry.id} value={enquiry.id}>
                    {enquiry.lead?.name ?? 'Lead'} — {enquiry.course?.name ?? 'Course'} (
                    {enquiry.branch?.name ?? 'Branch'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchId">Branch</Label>
              <select
                id="branchId"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
                disabled={isLoadingOptions || isSubmitting || mode === 'create'}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-primary outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseId">Course</Label>
              <select
                id="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                disabled={
                  isLoadingOptions ||
                  isSubmitting ||
                  !branchId ||
                  (mode === 'create' && !!selectedEnquiry)
                }
                className="flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-primary outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {!branchId ? 'Select branch first' : 'Select course'}
                </option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="batchId">Batch</Label>
              <select
                id="batchId"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
                disabled={
                  isLoadingOptions || isSubmitting || !courseId || !branchId
                }
                className="flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-primary outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {!courseId || !branchId
                    ? 'Select branch and course first'
                    : availableBatches.length === 0
                      ? 'No batches for this course & branch'
                      : 'Select batch'}
                </option>
                {availableBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admissionDate">Admission Date</Label>
              <Input
                id="admissionDate"
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AdmissionStatus)}
                required
                disabled={isSubmitting}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-primary outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {ADMISSION_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {statusLabels[value]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalFee">Total Fee (₹)</Label>
              <Input
                id="totalFee"
                type="number"
                min="0"
                step="0.01"
                value={totalFee}
                onChange={(e) => setTotalFee(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount (₹)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                disabled={isSubmitting}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Net Fee (₹)</Label>
              <div className="flex h-11 items-center rounded-xl border border-border/60 bg-background px-4 text-sm font-semibold text-primary">
                {netFee.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              {discountExceedsTotal && (
                <p className="text-xs text-danger">
                  Discount cannot exceed total fee
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Student Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                placeholder="student@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification (optional)</Label>
              <Input
                id="qualification"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. B.Tech, 12th Pass"
              />
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
                discountExceedsTotal ||
                !enquiryId ||
                !batchId
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Admission'
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
