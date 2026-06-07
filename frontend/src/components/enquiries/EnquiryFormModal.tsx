import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Branch } from '@/types/branch'
import type { Course } from '@/types/course'
import type { Enquiry, EnquiryPayload, EnquiryStatus } from '@/types/enquiry'
import { ENQUIRY_STATUSES } from '@/types/enquiry'
import type { Lead } from '@/types/lead'
import type { User } from '@/types/user'

interface EnquiryFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  enquiry?: Enquiry | null
  leads: Lead[]
  branches: Branch[]
  courses: Course[]
  users: User[]
  isLoadingOptions: boolean
  lockedBranchId?: string
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (data: EnquiryPayload) => void
}

const statusLabels: Record<EnquiryStatus, string> = {
  interested: 'Interested',
  not_interested: 'Not Interested',
  yet_to_decide: 'Yet to Decide',
  see_in_future: 'See in Future',
}

const statusColors: Record<EnquiryStatus, string> = {
  interested: 'text-success',
  not_interested: 'text-danger',
  yet_to_decide: 'text-warning',
  see_in_future: 'text-secondary',
}

export function EnquiryFormModal({
  open,
  mode,
  enquiry,
  leads,
  branches,
  courses,
  users,
  isLoadingOptions,
  lockedBranchId,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: EnquiryFormModalProps) {
  const [leadId, setLeadId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [enquiryDate, setEnquiryDate] = useState('')
  const [status, setStatus] = useState<EnquiryStatus>('yet_to_decide')
  const [notes, setNotes] = useState('')

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === leadId),
    [leads, leadId],
  )

  const availableCourses = useMemo(() => {
    if (!branchId) return []
    return courses.filter((course) => course.branchIds.includes(branchId))
  }, [branchId, courses])

  useEffect(() => {
    if (open) {
      setLeadId(enquiry?.leadId ?? '')
      setBranchId(enquiry?.branchId ?? lockedBranchId ?? '')
      setCourseId(enquiry?.courseId ?? '')
      setAssignedTo(enquiry?.assignedTo ?? '')
      setEnquiryDate(
        enquiry?.enquiryDate
          ? enquiry.enquiryDate.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      )
      setStatus(enquiry?.status ?? 'yet_to_decide')
      setNotes(enquiry?.notes ?? '')
    }
  }, [open, enquiry, lockedBranchId])

  useEffect(() => {
    if (mode === 'create' && selectedLead) {
      setBranchId(selectedLead.branchId)
      setCourseId(selectedLead.courseId)
      setAssignedTo(selectedLead.assignedTo)
    }
  }, [selectedLead, mode])

  useEffect(() => {
    if (courseId && !availableCourses.some((course) => course.id === courseId)) {
      setCourseId('')
    }
  }, [availableCourses, courseId])

  if (!open) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({
      leadId,
      branchId: lockedBranchId || branchId,
      courseId,
      assignedTo,
      enquiryDate,
      status,
      notes,
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
              {mode === 'create' ? 'Create Enquiry' : 'Edit Enquiry'}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Link a lead to a course enquiry and track follow-up status.
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
            <Label htmlFor="enquiry-lead">
              Select Lead <span className="text-danger">*</span>
            </Label>
            {isLoadingOptions ? (
              <div className="flex h-12 items-center gap-2 rounded-[var(--radius-input)] border border-border bg-input px-4 text-sm text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading leads...
              </div>
            ) : (
              <select
                id="enquiry-lead"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                required
                disabled={isSubmitting || leads.length === 0}
                className={selectClassName}
              >
                <option value="">Select lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} — {lead.number}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div
            className={
              lockedBranchId ? 'space-y-2' : 'grid gap-5 sm:grid-cols-2'
            }
          >
            {!lockedBranchId && (
              <div className="space-y-2">
                <Label htmlFor="enquiry-branch">
                  Branch <span className="text-danger">*</span>
                </Label>
                <select
                  id="enquiry-branch"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  required
                  disabled={isSubmitting || branches.length === 0}
                  className={selectClassName}
                >
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="enquiry-course">
                Course <span className="text-danger">*</span>
              </Label>
              <select
                id="enquiry-course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                disabled={
                  isSubmitting || !branchId || availableCourses.length === 0
                }
                className={selectClassName}
              >
                <option value="">
                  {branchId ? 'Select course' : 'Select branch first'}
                </option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="enquiry-assigned">
                Assigned To <span className="text-danger">*</span>
              </Label>
              <select
                id="enquiry-assigned"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
                disabled={isSubmitting || users.length === 0}
                className={selectClassName}
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enquiry-date">
                Enquiry Date <span className="text-danger">*</span>
              </Label>
              <Input
                id="enquiry-date"
                type="date"
                value={enquiryDate}
                onChange={(e) => setEnquiryDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enquiry-status">
              Status <span className="text-danger">*</span>
            </Label>
            <select
              id="enquiry-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
              required
              disabled={isSubmitting}
              className={selectClassName}
            >
              {ENQUIRY_STATUSES.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusLabels[statusOption]}
                </option>
              ))}
            </select>
            <p className={`text-xs font-medium ${statusColors[status]}`}>
              Current: {statusLabels[status]}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enquiry-notes">Notes</Label>
            <Textarea
              id="enquiry-notes"
              placeholder="Add follow-up notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            <Button
              type="submit"
              variant="primary"
              disabled={
                isSubmitting ||
                !leadId ||
                !branchId ||
                !courseId ||
                !assignedTo ||
                leads.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Enquiry'
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
