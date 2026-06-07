import { useCallback, useEffect, useState } from 'react'
import {
  Building2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
} from 'lucide-react'
import { DeleteInstituteModal } from '@/components/institutes/DeleteInstituteModal'
import { InstituteFormModal } from '@/components/institutes/InstituteFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useInstitute } from '@/context/InstituteContext'
import { cn } from '@/lib/utils'
import { ApiError, getAssetUrl } from '@/lib/api'
import { instituteService } from '@/services/instituteService'
import type { Institute, InstitutePayload } from '@/types/institute'

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

export function SettingsPage() {
  const { refreshInstitute } = useInstitute()
  const [institutes, setInstitutes] = useState<Institute[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(
    null,
  )
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Institute | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchInstitutes = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await instituteService.getAll()
      setInstitutes(response.data.institutes)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load institutes. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInstitutes()
  }, [fetchInstitutes])

  const filteredInstitutes = institutes.filter((institute) => {
    const query = search.toLowerCase()

    return (
      institute.name.toLowerCase().includes(query) ||
      institute.email.toLowerCase().includes(query) ||
      institute.phone.includes(query) ||
      institute.address.toLowerCase().includes(query) ||
      (institute.isActive ? 'active' : 'inactive').includes(query)
    )
  })

  const openCreateModal = () => {
    setFormMode('create')
    setSelectedInstitute(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEditModal = (institute: Institute) => {
    setFormMode('edit')
    setSelectedInstitute(institute)
    setFormError('')
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: InstitutePayload) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        await instituteService.create(data)
      } else if (selectedInstitute) {
        await instituteService.update(selectedInstitute.id, data)
      }

      setFormOpen(false)
      await fetchInstitutes()
      await refreshInstitute()
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Failed to save institute. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await instituteService.delete(deleteTarget.id)
      setDeleteTarget(null)
      await fetchInstitutes()
      await refreshInstitute()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to delete institute. Please try again.',
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
            <Settings className="h-3.5 w-3.5" />
            Portal Settings
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Settings
          </h1>
          <p className="mt-2 text-secondary">
            Manage institute profile, logo, and activation status.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={openCreateModal}>
          <Plus className="h-5 w-5" />
          Add Institute
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search institutes..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredInstitutes.length} institute
              {filteredInstitutes.length !== 1 ? 's' : ''} found
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
          ) : filteredInstitutes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No institutes match your search' : 'No institute yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Create your institute profile and upload a logo for the sidebar.'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4" />
                  Add Institute
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Logo</th>
                      <th className="px-5 py-4 font-semibold">Name</th>
                      <th className="px-5 py-4 font-semibold">Email</th>
                      <th className="px-5 py-4 font-semibold">Phone</th>
                      <th className="px-5 py-4 font-semibold">Address</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstitutes.map((institute) => (
                      <tr
                        key={institute.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background">
                            {institute.logo ? (
                              <img
                                src={getAssetUrl(institute.logo)}
                                alt={`${institute.name} logo`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-secondary" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-primary">
                          {institute.name}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {institute.email}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {institute.phone}
                        </td>
                        <td className="max-w-xs px-5 py-4 text-secondary">
                          <span className="line-clamp-2">
                            {institute.address}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <ActiveBadge isActive={institute.isActive} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(institute)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary"
                              aria-label={`Edit ${institute.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(institute)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                              aria-label={`Delete ${institute.name}`}
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

      <InstituteFormModal
        open={formOpen}
        mode={formMode}
        institute={selectedInstitute}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteInstituteModal
        institute={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
