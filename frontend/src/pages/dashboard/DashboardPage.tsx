import {
  GraduationCap,
  LayoutDashboard,
  TrendingUp,
  UserCog,
  Wallet,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const dashboardStats = {
  totalUsers: 24,
  totalStudents: 156,
  totalFeeCollected: 2847500,
}

function formatCurrency(amount: number) {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

interface StatCardProps {
  label: string
  value: string
  icon: React.ElementType
  iconBg: string
  trend?: string
}

function StatCard({ label, value, icon: Icon, iconBg, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-secondary">{label}</p>
            <p className="text-3xl font-bold tracking-tight text-primary">
              {value}
            </p>
            {trend && (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                <TrendingUp className="h-3.5 w-3.5" />
                {trend}
              </div>
            )}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
              iconBg,
            )}
          >
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-primary">
          <LayoutDashboard className="h-3.5 w-3.5" />
          Overview
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Dashboard
        </h1>
        <p className="mt-2 text-secondary">
          Quick snapshot of your institution&apos;s key metrics.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Users"
          value={dashboardStats.totalUsers.toLocaleString('en-IN')}
          icon={UserCog}
          iconBg="bg-lime/15"
          trend="+3 this month"
        />
        <StatCard
          label="Total Students"
          value={dashboardStats.totalStudents.toLocaleString('en-IN')}
          icon={GraduationCap}
          iconBg="bg-success/10"
          trend="+12 this month"
        />
        <StatCard
          label="Total Fee Collected"
          value={formatCurrency(dashboardStats.totalFeeCollected)}
          icon={Wallet}
          iconBg="bg-secondary/10"
          trend="+18% vs last month"
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-primary">Summary</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            This dashboard displays sample data for preview purposes. Connect
            live APIs later to show real-time counts from users, students, and
            fee collections.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                Staff Users
              </p>
              <p className="mt-1 text-xl font-bold text-primary">
                {dashboardStats.totalUsers}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                Active Students
              </p>
              <p className="mt-1 text-xl font-bold text-primary">
                {dashboardStats.totalStudents}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                Fees Collected
              </p>
              <p className="mt-1 text-xl font-bold text-primary">
                {formatCurrency(dashboardStats.totalFeeCollected)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
