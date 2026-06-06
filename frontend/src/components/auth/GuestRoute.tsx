import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-lime" />
          <p className="text-sm font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/enquiries" replace />
  }

  return <Outlet />
}
