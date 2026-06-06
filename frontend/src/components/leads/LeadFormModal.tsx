import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Branch } from '@/types/branch'
import type { Course } from '@/types/course'
import type {
  Lead,
  LeadCreatePayload,
  LeadSource,
  LeadUpdatePayload,
} from '@/types/lead'
import { LEAD_SOURCES } from '@/types/lead'
import type { User } from '@/types/user'

interface LeadFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  lead?: Lead | null
  branches: Branch[]
  courses: Course[]
  users: User[]
  isLoadingOptions: boolean
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (data: LeadCreatePayload | LeadUpdatePayload) => void
}

const sourceLabels: Record<LeadSource, string> = {
  referral: 'Referral',
  website: 'Website',
  walkin: 'Walk In',
  offline_campaign: 'Offline Campaign',
}

export function LeadFormModal({
  open,
  mode,
  lead,
  branches,
  courses,
  users,
  isLoadingOptions,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: LeadFormModalProps) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [sameAsPhone, setSameAsPhone] = useState(false)
  const [alternateNumber, setAlternateNumber] = useState('')
  const [branchId, setBranchId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [source, setSource] = useState<LeadSource>('website')
  const [assignedTo, setAssignedTo] = useState('')

  const availableCourses = useMemo(() => {
    if (!branchId) return []

    return courses.filter((course) => course.branchIds.includes(branchId))
  }, [branchId, courses])

  useEffect(() => {
    if (open) {
      setName(lead?.name ?? '')
      setNumber(lead?.number ?? '')
      setWhatsappNumber(lead?.whatsappNumber ?? '')
      setSameAsPhone(
        mode === 'create'
          ? false
          : lead?.whatsappNumber === lead?.number,
      )
      setAlternateNumber(lead?.alternateNumber ?? '')
      setBranchId(lead?.branchId ?? '')
      setCourseId(lead?.courseId ?? '')
      setSource(lead?.source ?? 'website')
      setAssignedTo(lead?.assignedTo ?? '')
    }
  }, [open, lead, mode])

  useEffect(() => {
    if (sameAsPhone && mode === 'create') {
      setWhatsappNumber(number)
    }
  }, [sameAsPhone, number, mode])

  useEffect(() => {
    if (courseId && !availableCourses.some((course) => course.id === courseId)) {
      setCourseId('')
    }
  }, [availableCourses, courseId])

  if (!open) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      name,
      whatsappNumber,
      alternateNumber: alternateNumber || '',
      branchId,
      courseId,
      source,
      assignedTo,
    }

    if (mode === 'create') {
      onSubmit({ ...payload, number })
      return
    }

    onSubmit(payload)
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
              {mode === 'create' ? 'Create Lead' : 'Edit Lead'}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Capture prospective student details and assign follow-up.
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
            <Label htmlFor="lead-name">
              Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="lead-name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-number">
                Phone Number <span className="text-danger">*</span>
              </Label>
              <Input
                id="lead-number"
                type="tel"
                placeholder="9876543210"
                value={number}
                onChange={(e) =>
                  setNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                required
                disabled={isSubmitting || mode === 'edit'}
                className={mode === 'edit' ? 'bg-background' : ''}
              />
              {mode === 'edit' && (
                <p className="text-xs text-secondary">
                  Phone number cannot be changed after creation.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-whatsapp">
                WhatsApp Number <span className="text-danger">*</span>
              </Label>
              <Input
                id="lead-whatsapp"
                type="tel"
                placeholder="9876543210"
                value={whatsappNumber}
                onChange={(e) => {
                  setSameAsPhone(false)
                  setWhatsappNumber(
                    e.target.value.replace(/\D/g, '').slice(0, 10),
                  )
                }}
                required
                disabled={isSubmitting || (mode === 'create' && sameAsPhone)}
              />
              {mode === 'create' && (
                <label className="flex items-center gap-2 text-sm text-secondary">
                  <Checkbox
                    checked={sameAsPhone}
                    onCheckedChange={(checked) =>
                      setSameAsPhone(checked === true)
                    }
                    disabled={isSubmitting}
                  />
                  Same as phone number
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-alternate">Alternate Number</Label>
            <Input
              id="lead-alternate"
              type="tel"
              placeholder="Optional"
              value={alternateNumber}
              onChange={(e) =>
                setAlternateNumber(
                  e.target.value.replace(/\D/g, '').slice(0, 10),
                )
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-branch">
                Branch <span className="text-danger">*</span>
              </Label>
              {isLoadingOptions ? (
                <div className="flex h-12 items-center gap-2 rounded-[var(--radius-input)] border border-border bg-input px-4 text-sm text-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <select
                  id="lead-branch"
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
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-course">
                Interested Course <span className="text-danger">*</span>
              </Label>
              <select
                id="lead-course"
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
              <Label htmlFor="lead-source">
                Source <span className="text-danger">*</span>
              </Label>
              <select
                id="lead-source"
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                required
                disabled={isSubmitting}
                className={selectClassName}
              >
                {LEAD_SOURCES.map((sourceOption) => (
                  <option key={sourceOption} value={sourceOption}>
                    {sourceLabels[sourceOption]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-assigned">
                Assigned To <span className="text-danger">*</span>
              </Label>
              <select
                id="lead-assigned"
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
                !branchId ||
                !courseId ||
                !assignedTo ||
                branches.length === 0 ||
                users.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Lead'
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
