import { useCallback, useEffect, useState } from 'react'
import {
  Layers,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Trash2,
} from 'lucide-react'
import { DeleteSectionModal } from '@/components/sections/DeleteSectionModal'
import { SectionFormModal } from '@/components/sections/SectionFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api'
import { branchService } from '@/services/branchService'
import { courseService } from '@/services/courseService'
import { sectionService } from '@/services/sectionService'
import type { Branch } from '@/types/branch'
import type { Course } from '@/types/course'
import type { Section, SectionPayload } from '@/types/section'

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        isActive ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary',
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
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

export function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)

  const fetchSections = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await sectionService.getAll()
      setSections(response.data.sections)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load sections. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchOptions = useCallback(async () => {
    setIsLoadingOptions(true)

    try {
      const [coursesResponse, branchesResponse] = await Promise.all([
        courseService.getAll(),
        branchService.getAll(),
      ])

      setCourses(coursesResponse.data.courses.filter((course) => course.isActive))
      setBranches(
        branchesResponse.data.branches.filter((branch) => branch.status === 'active'),
      )
    } catch {
      setCourses([])
      setBranches([])
    } finally {
      setIsLoadingOptions(false)
    }
  }, [])

  useEffect(() => {
    fetchSections()
    fetchOptions()
  }, [fetchSections, fetchOptions])

  const filteredSections = sections.filter((section) => {
    const query = search.toLowerCase()

    return (
      section.name.toLowerCase().includes(query) ||
      section.course?.name?.toLowerCase().includes(query) ||
      section.branch?.name?.toLowerCase().includes(query) ||
      section.branch?.code?.toLowerCase().includes(query) ||
      (section.isActive ? 'active' : 'inactive').includes(query)
    )
  })

  const openCreateModal = () => {
    setFormMode('create')
    setSelectedSection(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEditModal = (section: Section) => {
    setFormMode('edit')
    setSelectedSection(section)
    setFormError('')
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: SectionPayload) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        await sectionService.create(data)
      } else if (selectedSection) {
        await sectionService.update(selectedSection.id, data)
      }

      setFormOpen(false)
      await fetchSections()
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Failed to save section. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await sectionService.delete(deleteTarget.id)
      setDeleteTarget(null)
      await fetchSections()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to delete section. Please try again.',
      )
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async (section: Section) => {
    setStatusUpdatingId(section.id)
    setError('')

    try {
      if (section.isActive) {
        await sectionService.deactivate(section.id)
      } else {
        await sectionService.activate(section.id)
      }

      await fetchSections()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to update section status. Please try again.',
      )
    } finally {
      setStatusUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-primary">
            <Layers className="h-3.5 w-3.5" />
            Branch Sections
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Sections
          </h1>
          <p className="mt-2 text-secondary">
            Manage course sections scheduled at specific branches.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={openCreateModal}>
          <Plus className="h-5 w-5" />
          Add Section
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search sections..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredSections.length} section
              {filteredSections.length !== 1 ? 's' : ''} found
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
          ) : filteredSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <Layers className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No sections match your search' : 'No sections yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Create your first section to link a course with a branch.'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Section Name</th>
                      <th className="px-5 py-4 font-semibold">Course</th>
                      <th className="px-5 py-4 font-semibold">Branch</th>
                      <th className="px-5 py-4 font-semibold">Start Date</th>
                      <th className="px-5 py-4 font-semibold">End Date</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSections.map((section) => (
                      <tr
                        key={section.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4 font-semibold text-primary">
                          {section.name}
                        </td>
                        <td className="px-5 py-4 text-primary">
                          {section.course?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-primary">
                              {section.branch?.name ?? '—'}
                            </p>
                            {section.branch?.code && (
                              <p className="mt-0.5 font-mono text-xs text-secondary">
                                {section.branch.code}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {formatDisplayDate(section.startDate)}
                        </td>
                        <td className="px-5 py-4 text-secondary">
                          {formatDisplayDate(section.endDate)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge isActive={section.isActive} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(section)}
                              disabled={statusUpdatingId === section.id}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary disabled:opacity-50"
                              aria-label={
                                section.isActive
                                  ? `Deactivate ${section.name}`
                                  : `Activate ${section.name}`
                              }
                              title={
                                section.isActive ? 'Deactivate' : 'Activate'
                              }
                            >
                              {statusUpdatingId === section.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : section.isActive ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(section)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary"
                              aria-label={`Edit ${section.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(section)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                              aria-label={`Delete ${section.name}`}
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

      <SectionFormModal
        open={formOpen}
        mode={formMode}
        section={selectedSection}
        courses={courses}
        branches={branches}
        isLoadingOptions={isLoadingOptions}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteSectionModal
        section={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
