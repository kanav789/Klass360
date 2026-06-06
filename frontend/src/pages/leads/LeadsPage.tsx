import { useCallback, useEffect, useState } from 'react'
import {
  Loader2,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import { DeleteLeadModal } from '@/components/leads/DeleteLeadModal'
import { LeadFormModal } from '@/components/leads/LeadFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { branchService } from '@/services/branchService'
import { courseService } from '@/services/courseService'
import { leadService } from '@/services/leadService'
import { userService } from '@/services/userService'
import type { Branch } from '@/types/branch'
import type { Course } from '@/types/course'
import type {
  Lead,
  LeadCreatePayload,
  LeadSource,
  LeadUpdatePayload,
} from '@/types/lead'
import type { User } from '@/types/user'

const sourceLabels: Record<LeadSource, string> = {
  referral: 'Referral',
  website: 'Website',
  walkin: 'Walk In',
  offline_campaign: 'Offline Campaign',
}

function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className="inline-flex rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-primary">
      {sourceLabels[source]}
    </span>
  )
}

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchLeads = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await leadService.getAll()
      setLeads(response.data.leads)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load leads. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchOptions = useCallback(async () => {
    setIsLoadingOptions(true)

    try {
      const [branchesResponse, coursesResponse, usersResponse] =
        await Promise.all([
          branchService.getAll(),
          courseService.getAll(),
          userService.getAll(),
        ])

      setBranches(
        branchesResponse.data.branches.filter(
          (branch) => branch.status === 'active',
        ),
      )
      setCourses(
        coursesResponse.data.courses.filter((course) => course.isActive),
      )
      setUsers(usersResponse.data.users)
    } catch {
      setBranches([])
      setCourses([])
      setUsers([])
    } finally {
      setIsLoadingOptions(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    fetchOptions()
  }, [fetchLeads, fetchOptions])

  const filteredLeads = leads.filter((lead) => {
    const query = search.toLowerCase()

    return (
      lead.name.toLowerCase().includes(query) ||
      lead.number.includes(query) ||
      lead.whatsappNumber.includes(query) ||
      lead.alternateNumber.includes(query) ||
      lead.branch?.name?.toLowerCase().includes(query) ||
      lead.course?.name?.toLowerCase().includes(query) ||
      lead.assignedUser?.firstName?.toLowerCase().includes(query) ||
      lead.assignedUser?.lastName?.toLowerCase().includes(query) ||
      sourceLabels[lead.source].toLowerCase().includes(query)
    )
  })

  const openCreateModal = () => {
    setFormMode('create')
    setSelectedLead(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEditModal = (lead: Lead) => {
    setFormMode('edit')
    setSelectedLead(lead)
    setFormError('')
    setFormOpen(true)
  }

  const handleFormSubmit = async (
    data: LeadCreatePayload | LeadUpdatePayload,
  ) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        await leadService.create(data as LeadCreatePayload)
      } else if (selectedLead) {
        await leadService.update(selectedLead.id, data as LeadUpdatePayload)
      }

      setFormOpen(false)
      await fetchLeads()
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Failed to save lead. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await leadService.delete(deleteTarget.id)
      setDeleteTarget(null)
      await fetchLeads()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to delete lead. Please try again.',
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
            <Users className="h-3.5 w-3.5" />
            Lead Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Leads
          </h1>
          <p className="mt-2 text-secondary">
            Track prospective students and assign follow-ups to your team.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={openCreateModal}>
          <Plus className="h-5 w-5" />
          Add Lead
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search leads..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredLeads.length} lead
              {filteredLeads.length !== 1 ? 's' : ''} found
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
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No leads match your search' : 'No leads yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Create your first lead to start tracking prospects.'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Name</th>
                      <th className="px-5 py-4 font-semibold">Phone</th>
                      <th className="px-5 py-4 font-semibold">Branch</th>
                      <th className="px-5 py-4 font-semibold">Course</th>
                      <th className="px-5 py-4 font-semibold">Source</th>
                      <th className="px-5 py-4 font-semibold">Assigned To</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4 font-semibold text-primary">
                          {lead.name}
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1 text-secondary">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 shrink-0" />
                              {lead.number}
                            </div>
                            {lead.whatsappNumber !== lead.number && (
                              <p className="text-xs">
                                WA: {lead.whatsappNumber}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {lead.branch?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {lead.course?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4">
                          <SourceBadge source={lead.source} />
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {lead.assignedUser
                            ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}`
                            : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(lead)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary"
                              aria-label={`Edit ${lead.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(lead)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                              aria-label={`Delete ${lead.name}`}
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

      <LeadFormModal
        open={formOpen}
        mode={formMode}
        lead={selectedLead}
        branches={branches}
        courses={courses}
        users={users}
        isLoadingOptions={isLoadingOptions}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteLeadModal
        lead={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
