import { useCallback, useEffect, useState } from 'react'
import {
  Building2,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { BranchFormModal } from '@/components/branches/BranchFormModal'
import { DeleteBranchModal } from '@/components/branches/DeleteBranchModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { branchService } from '@/services/branchService'
import type { Branch } from '@/types/branch'

export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBranches = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await branchService.getAll()
      setBranches(response.data.branches)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load branches. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const filteredBranches = branches.filter((branch) => {
    const query = search.toLowerCase()
    return (
      branch.name.toLowerCase().includes(query) ||
      branch.address.toLowerCase().includes(query)
    )
  })

  const openCreateModal = () => {
    setFormMode('create')
    setSelectedBranch(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEditModal = (branch: Branch) => {
    setFormMode('edit')
    setSelectedBranch(branch)
    setFormError('')
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: { name: string; address: string }) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        await branchService.create(data)
      } else if (selectedBranch) {
        await branchService.update(selectedBranch.id, data)
      }

      setFormOpen(false)
      await fetchBranches()
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Failed to save branch. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await branchService.delete(deleteTarget.id)
      setDeleteTarget(null)
      await fetchBranches()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to delete branch. Please try again.',
      )
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-primary">
            <Building2 className="h-3.5 w-3.5" />
            Branch Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Branches
          </h1>
          <p className="mt-2 text-secondary">
            Create and manage institute branches with entity names and addresses.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={openCreateModal}>
          <Plus className="h-5 w-5" />
          Add Branch
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search branches..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredBranches.length} branch
              {filteredBranches.length !== 1 ? 'es' : ''} found
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
          ) : filteredBranches.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No branches match your search' : 'No branches yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Create your first branch to get started.'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4" />
                  Add Branch
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Entity Name</th>
                      <th className="px-5 py-4 font-semibold">Address</th>
                      <th className="px-5 py-4 font-semibold">Created</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBranches.map((branch) => (
                      <tr
                        key={branch.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime/15">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-semibold text-primary">
                              {branch.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2 text-secondary">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="max-w-md leading-relaxed">
                              {branch.address}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {formatDate(branch.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(branch)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary"
                              aria-label={`Edit ${branch.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(branch)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                              aria-label={`Delete ${branch.name}`}
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

      <BranchFormModal
        open={formOpen}
        mode={formMode}
        branch={selectedBranch}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteBranchModal
        branch={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
