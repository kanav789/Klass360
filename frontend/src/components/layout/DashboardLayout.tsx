import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-[260px]">
        <TopHeader />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
