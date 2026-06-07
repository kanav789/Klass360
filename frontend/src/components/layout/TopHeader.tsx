import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Bell, Store, LayoutGrid, LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useBranchFilter } from '@/context/BranchFilterContext'

export function TopHeader() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const {
    branches,
    selectedBranchId,
    setSelectedBranchId,
    isLoadingBranches,
  } = useBranchFilter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const initials = admin?.fullName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/60 bg-card/80 px-8 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <select
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          disabled={isLoadingBranches}
          className="flex h-11 w-full appearance-none rounded-xl border border-transparent bg-background pl-11 pr-10 text-sm font-medium text-primary outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Filter by branch"
        >
          <option value="">All Branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name} ({branch.code})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-background hover:text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-danger" />
        </button>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-background hover:text-primary"
          aria-label="Store"
        >
          <Store className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-background hover:text-primary"
          aria-label="App launcher"
        >
          <LayoutGrid className="h-5 w-5" />
        </button>

        <div className="ml-2 hidden text-right sm:block">
          <p className="text-sm font-semibold text-primary">{admin?.fullName}</p>
          <p className="text-xs text-secondary">{admin?.email}</p>
        </div>

        <div
          className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-sidebar text-sm font-bold text-lime ring-2 ring-border"
          title={admin?.fullName}
        >
          {initials || 'AD'}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
          aria-label="Logout"
          title="Logout"
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  )
}
