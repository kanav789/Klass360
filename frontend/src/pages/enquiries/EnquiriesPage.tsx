import { useCallback, useEffect, useState } from 'react'
import {
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { DeleteEnquiryModal } from '@/components/enquiries/DeleteEnquiryModal'
import { EnquiryFormModal } from '@/components/enquiries/EnquiryFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api'
import { branchService } from '@/services/branchService'
import { courseService } from '@/services/courseService'
import { enquiryService } from '@/services/enquiryService'
import { leadService } from '@/services/leadService'
import { userService } from '@/services/userService'
import type { Branch } from '@/types/branch'
import type { Course } from '@/types/course'
import type { Enquiry, EnquiryPayload, EnquiryStatus } from '@/types/enquiry'
import type { Lead } from '@/types/lead'
import type { User } from '@/types/user'

const statusLabels: Record<EnquiryStatus, string> = {
  interested: 'Interested',
  not_interested: 'Not Interested',
  yet_to_decide: 'Yet to Decide',
  see_in_future: 'See in Future',
}

function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        status === 'interested' && 'bg-success/10 text-success',
        status === 'not_interested' && 'bg-danger/10 text-danger',
        status === 'yet_to_decide' && 'bg-warning/10 text-warning',
        status === 'see_in_future' && 'bg-secondary/10 text-secondary',
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

export function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
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
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await enquiryService.getAll()
      setEnquiries(response.data.enquiries)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load enquiries. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchOptions = useCallback(async () => {
    setIsLoadingOptions(true)

    try {
      const [leadsResponse, branchesResponse, coursesResponse, usersResponse] =
        await Promise.all([
          leadService.getAll(),
          branchService.getAll(),
          courseService.getAll(),
          userService.getAll(),
        ])

      setLeads(leadsResponse.data.leads)
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
      setLeads([])
      setBranches([])
      setCourses([])
      setUsers([])
    } finally {
      setIsLoadingOptions(false)
    }
  }, [])

  useEffect(() => {
    fetchEnquiries()
    fetchOptions()
  }, [fetchEnquiries, fetchOptions])

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const query = search.toLowerCase()

    return (
      enquiry.lead?.name?.toLowerCase().includes(query) ||
      enquiry.lead?.number?.includes(query) ||
      enquiry.branch?.name?.toLowerCase().includes(query) ||
      enquiry.course?.name?.toLowerCase().includes(query) ||
      enquiry.assignedUser?.firstName?.toLowerCase().includes(query) ||
      enquiry.assignedUser?.lastName?.toLowerCase().includes(query) ||
      statusLabels[enquiry.status].toLowerCase().includes(query) ||
      enquiry.notes.toLowerCase().includes(query)
    )
  })

  const openCreateModal = () => {
    setFormMode('create')
    setSelectedEnquiry(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEditModal = (enquiry: Enquiry) => {
    setFormMode('edit')
    setSelectedEnquiry(enquiry)
    setFormError('')
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: EnquiryPayload) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        await enquiryService.create(data)
      } else if (selectedEnquiry) {
        await enquiryService.update(selectedEnquiry.id, data)
      }

      setFormOpen(false)
      await fetchEnquiries()
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Failed to save enquiry. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await enquiryService.delete(deleteTarget.id)
      setDeleteTarget(null)
      await fetchEnquiries()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to delete enquiry. Please try again.',
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
            <MessageSquare className="h-3.5 w-3.5" />
            Enquiry Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Enquiries
          </h1>
          <p className="mt-2 text-secondary">
            Convert leads into tracked enquiries with status and notes.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={openCreateModal}>
          <Plus className="h-5 w-5" />
          Add Enquiry
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search enquiries..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredEnquiries.length} enquir
              {filteredEnquiries.length !== 1 ? 'ies' : 'y'} found
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
          ) : filteredEnquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No enquiries match your search' : 'No enquiries yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Create your first enquiry from an existing lead.'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4" />
                  Add Enquiry
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Lead</th>
                      <th className="px-5 py-4 font-semibold">Branch</th>
                      <th className="px-5 py-4 font-semibold">Course</th>
                      <th className="px-5 py-4 font-semibold">Assigned To</th>
                      <th className="px-5 py-4 font-semibold">Date</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Notes</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnquiries.map((enquiry) => (
                      <tr
                        key={enquiry.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-primary">
                              {enquiry.lead?.name ?? '—'}
                            </p>
                            <p className="text-xs text-secondary">
                              {enquiry.lead?.number ?? ''}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {enquiry.branch?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {enquiry.course?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {enquiry.assignedUser
                            ? `${enquiry.assignedUser.firstName} ${enquiry.assignedUser.lastName}`
                            : '—'}
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {formatDisplayDate(enquiry.enquiryDate)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={enquiry.status} />
                        </td>
                        <td className="max-w-xs px-5 py-4 text-secondary">
                          <span className="line-clamp-2">
                            {enquiry.notes || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(enquiry)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary"
                              aria-label={`Edit enquiry for ${enquiry.lead?.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(enquiry)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                              aria-label={`Delete enquiry for ${enquiry.lead?.name}`}
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

      <EnquiryFormModal
        open={formOpen}
        mode={formMode}
        enquiry={selectedEnquiry}
        leads={leads}
        branches={branches}
        courses={courses}
        users={users}
        isLoadingOptions={isLoadingOptions}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteEnquiryModal
        enquiry={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
