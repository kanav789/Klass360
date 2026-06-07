import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Branch } from '@/types/branch'
import type { User, UserPayload, UserRole } from '@/types/user'
import { USER_ROLES } from '@/types/user'

interface UserFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  user?: User | null
  branches: Branch[]
  lockedBranchId?: string
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (data: UserPayload) => void
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  counselor: 'Counselor',
  teacher: 'Teacher',
  accountant: 'Accountant',
  receptionist: 'Receptionist',
}

export function UserFormModal({
  open,
  mode,
  user,
  branches,
  lockedBranchId,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('counselor')
  const [branchId, setBranchId] = useState('')

  useEffect(() => {
    if (open) {
      setFirstName(user?.firstName ?? '')
      setLastName(user?.lastName ?? '')
      setMobile(user?.mobile ?? '')
      setEmail(user?.email ?? '')
      setRole(user?.role ?? 'counselor')
      setBranchId(user?.branchId ?? lockedBranchId ?? '')
    }
  }, [open, user, lockedBranchId])

  if (!open) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ firstName, lastName, mobile, email, role, branchId })
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

      <div className="relative w-full max-w-lg rounded-[var(--radius-card)] border border-border/60 bg-card p-6 shadow-[var(--shadow-card-hover)]">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {mode === 'create' ? 'Add User' : 'Edit User'}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Manage institute staff and assign their role.
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
              <Label htmlFor="user-first-name">
                First Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="user-first-name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-last-name">
                Last Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="user-last-name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-mobile">
              Mobile <span className="text-danger">*</span>
            </Label>
            <Input
              id="user-mobile"
              type="tel"
              placeholder="9876543210"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">
              Email <span className="text-danger">*</span>
            </Label>
            <Input
              id="user-email"
              type="email"
              placeholder="user@klass360.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-branch">
              Branch <span className="text-danger">*</span>
            </Label>
            <select
              id="user-branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              required
              disabled={isSubmitting || !!lockedBranchId || branches.length === 0}
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

          <div className="space-y-2">
            <Label htmlFor="user-role">
              Role <span className="text-danger">*</span>
            </Label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
              disabled={isSubmitting}
              className={selectClassName}
            >
              {USER_ROLES.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleLabels[roleOption]}
                </option>
              ))}
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
                'Add User'
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
