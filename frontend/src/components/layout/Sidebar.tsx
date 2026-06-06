import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  GraduationCap,
  Wallet,
  BarChart3,
  Calendar,
  Building2,
  Settings,
  Headphones,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const mainNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Leads', icon: Users, path: '/leads' },
  { label: 'Enquiries', icon: MessageSquare, path: '/enquiries' },
  { label: 'Students', icon: GraduationCap, path: '/students' },
  { label: 'Branch', icon: Building2, path: '/branches' },
  { label: 'Fees', icon: Wallet, path: '/fees' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Calendar', icon: Calendar, path: '/calendar' },
]

const bottomNavItems = [
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Support', icon: Headphones, path: '/support' },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-sidebar">
      <div className="flex flex-col gap-8 px-5 py-7">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Klass360
          </h1>
          <p className="mt-0.5 text-xs font-medium text-white/50">
            Admin Portal
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full gap-2 rounded-xl font-bold"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          New Enquiry
        </Button>

        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-lime font-semibold text-primary'
                    : 'text-white/75 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 px-5 py-5">
        <nav className="flex flex-col gap-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-lime font-semibold text-primary'
                    : 'text-white/75 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
