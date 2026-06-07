import { useCallback, useEffect, useState } from 'react'
import {
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCog,
} from 'lucide-react'
import { DeleteUserModal } from '@/components/users/DeleteUserModal'
import { UserFormModal } from '@/components/users/UserFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useBranchFilter } from '@/context/BranchFilterContext'
import { useBranchQuery } from '@/hooks/useBranchQuery'
import { ApiError } from '@/lib/api'
import { userService } from '@/services/userService'
import type { User, UserPayload, UserRole } from '@/types/user'

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  counselor: 'Counselor',
  teacher: 'Teacher',
  accountant: 'Accountant',
  receptionist: 'Receptionist',
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className="inline-flex rounded-full bg-lime/15 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
      {roleLabels[role]}
    </span>
  )
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

export function UsersPage() {
  const branchQuery = useBranchQuery()
  const { selectedBranchId, branches } = useBranchFilter()
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await userService.getAll(branchQuery)
      setUsers(response.data.users)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load users. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [branchQuery])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase()
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()

    return (
      fullName.includes(query) ||
      user.mobile.includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  })

  const openCreateModal = () => {
    setFormMode('create')
    setSelectedUser(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEditModal = (user: User) => {
    setFormMode('edit')
    setSelectedUser(user)
    setFormError('')
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: UserPayload) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        await userService.create(data)
      } else if (selectedUser) {
        await userService.update(selectedUser.id, data)
      }

      setFormOpen(false)
      await fetchUsers()
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Failed to save user. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await userService.delete(deleteTarget.id)
      setDeleteTarget(null)
      await fetchUsers()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to delete user. Please try again.',
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
            <UserCog className="h-3.5 w-3.5" />
            User Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Users
          </h1>
          <p className="mt-2 text-secondary">
            Manage institute staff, roles, and contact information.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={openCreateModal}>
          <Plus className="h-5 w-5" />
          Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Search users..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-secondary">
              {filteredUsers.length} user
              {filteredUsers.length !== 1 ? 's' : ''} found
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
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-background py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
                <UserCog className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {search ? 'No users match your search' : 'No users yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                {search
                  ? 'Try a different search term.'
                  : 'Add your first institute user to get started.'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-left text-sm">
                  <thead className="sticky top-0 bg-background text-secondary">
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-4 font-semibold">Name</th>
                      <th className="px-5 py-4 font-semibold">Mobile</th>
                      <th className="px-5 py-4 font-semibold">Email</th>
                      <th className="px-5 py-4 font-semibold">Role</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-background/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar text-sm font-bold text-lime">
                              {getInitials(user.firstName, user.lastName)}
                            </div>
                            <div>
                              <p className="font-semibold text-primary">
                                {user.firstName} {user.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-secondary">
                            <Phone className="h-4 w-4 shrink-0" />
                            {user.mobile}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-secondary">
                            <Mail className="h-4 w-4 shrink-0" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-lime/15 hover:text-primary"
                              aria-label={`Edit ${user.firstName} ${user.lastName}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                              aria-label={`Delete ${user.firstName} ${user.lastName}`}
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

      <UserFormModal
        open={formOpen}
        mode={formMode}
        user={selectedUser}
        branches={branches}
        lockedBranchId={selectedBranchId || undefined}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteUserModal
        user={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
