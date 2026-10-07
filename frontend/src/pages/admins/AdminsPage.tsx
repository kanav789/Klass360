import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Eye,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useInstitute } from '@/context/InstituteContext'
import { ApiError } from '@/lib/api'
import { adminService } from '@/services/adminService'
import { instituteService } from '@/services/instituteService'
import type { AdminAccount } from '@/types/admin'
import type { Institute } from '@/types/institute'

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive ? 'bg-lime/15 text-primary' : 'bg-danger/10 text-danger'
      }`}
    >
      {isActive ? 'Active' : 'Deactivated'}
    </span>
  )
}

function RoleBadge({ role }: { role: AdminAccount['role'] }) {
  return (
    <span className="inline-flex rounded-full bg-sidebar px-2.5 py-1 text-xs font-semibold capitalize text-lime">
      {role === 'superadmin' ? 'Super Admin' : 'Admin'}
    </span>
  )
}

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDate(value?: string | null) {
  if (!value) return 'Never'

  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function AdminsPage() {
  const navigate = useNavigate()
  const { admin: currentAdmin } = useAuth()
  const { selectInstitute } = useInstitute()

  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [viewTarget, setViewTarget] = useState<AdminAccount | null>(null)
  const [viewInstitutes, setViewInstitutes] = useState<Institute[]>([])
  const [isLoadingInstitutes, setIsLoadingInstitutes] = useState(false)

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await adminService.getAll()
      setAdmins(response.data.admins)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load admins. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  const filteredAdmins = admins.filter((admin) => {
    const query = search.toLowerCase()

    return (
      admin.fullName.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query)
    )
  })

  const handleToggleStatus = async (admin: AdminAccount) => {
    setUpdatingId(admin.id)
    setError('')

    try {
      await adminService.update(admin.id, { isActive: !admin.isActive })
      await fetchAdmins()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to update admin. Please try again.',
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const openViewInstitutes = async (admin: AdminAccount) => {
    setViewTarget(admin)
    setViewInstitutes([])
    setIsLoadingInstitutes(true)

    try {
      const response = await instituteService.getAll({ ownerId: admin.id })
      setViewInstitutes(response.data.institutes)
    } catch {
      setViewInstitutes([])
    } finally {
      setIsLoadingInstitutes(false)
    }
  }

  const handleViewInstitute = (instituteId: string) => {
    selectInstitute(instituteId)
    setViewTarget(null)
    navigate('/enquiries')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Admin
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Admins
          </h1>
          <p className="mt-2 text-secondary">
            View all platform admins and access their institute data.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search admins..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredAdmins.length} admin
              {filteredAdmins.length !== 1 ? 's' : ''} found
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
          ) : filteredAdmins.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No admins match your search' : 'No admins yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Admin accounts created through signup will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Admin</th>
                      <th className="px-5 py-4 font-semibold">Role</th>
                      <th className="px-5 py-4 font-semibold">Institutes</th>
                      <th className="px-5 py-4 font-semibold">Last Login</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar text-sm font-bold text-lime">
                              {getInitials(admin.fullName)}
                            </div>
                            <div>
                              <p className="font-semibold text-primary">
                                {admin.fullName}
                                {admin.id === currentAdmin?.id && (
                                  <span className="ml-2 text-xs font-medium text-secondary">
                                    (you)
                                  </span>
                                )}
                              </p>
                              <div className="mt-0.5 flex items-center gap-1.5 text-secondary">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-xs">{admin.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <RoleBadge role={admin.role} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-secondary">
                            <Building2 className="h-4 w-4 shrink-0" />
                            {admin.instituteCount ?? 0}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {formatDate(admin.lastLoginAt)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge isActive={admin.isActive} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openViewInstitutes(admin)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary"
                              aria-label={`View data of ${admin.fullName}`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {admin.id !== currentAdmin?.id && (
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={updatingId === admin.id}
                                onClick={() => handleToggleStatus(admin)}
                              >
                                {updatingId === admin.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : admin.isActive ? (
                                  'Deactivate'
                                ) : (
                                  'Activate'
                                )}
                              </Button>
                            )}
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

      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            onClick={() => setViewTarget(null)}
            aria-label="Close modal"
          />

          <div className="relative w-full max-w-md rounded-[var(--radius-card)] border border-border/60 bg-card p-6 shadow-[var(--shadow-card-hover)]">
            <h2 className="text-xl font-bold text-primary">
              Institutes of {viewTarget.fullName}
            </h2>
            <p className="mt-2 text-sm text-secondary">
              Select an institute to browse its data.
            </p>

            <div className="mt-5 max-h-72 space-y-2 overflow-y-auto">
              {isLoadingInstitutes ? (
                <div className="flex items-center justify-center py-8 text-secondary">
                  <Loader2 className="h-6 w-6 animate-spin text-lime" />
                </div>
              ) : viewInstitutes.length === 0 ? (
                <p className="py-8 text-center text-sm text-secondary">
                  This admin has no institutes yet.
                </p>
              ) : (
                viewInstitutes.map((institute) => (
                  <button
                    key={institute.id}
                    type="button"
                    onClick={() => handleViewInstitute(institute.id)}
                    className="flex w-full items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-left transition-colors hover:border-lime/50 hover:bg-lime/10"
                  >
                    <span className="font-medium text-primary">
                      {institute.name}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-secondary" />
                  </button>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setViewTarget(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
