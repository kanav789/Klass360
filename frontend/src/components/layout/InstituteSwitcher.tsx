import { Link } from 'react-router-dom'
import { Building2, ChevronsUpDown } from 'lucide-react'
import { useInstitute } from '@/context/InstituteContext'
import { useAuth } from '@/context/AuthContext'

export function InstituteSwitcher() {
  const { institutes, institute, selectInstitute, isLoading } = useInstitute()
  const { admin } = useAuth()
  const isSuperAdmin = admin?.role === 'superadmin'

  if (isLoading) {
    return <div className="h-[42px] animate-pulse rounded-xl bg-white/5" />
  }

  if (institutes.length === 0) {
    return (
      <Link
        to="/settings"
        className="flex items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-lime/50 hover:text-white"
      >
        <Building2 className="h-4 w-4 text-lime" />
        Create your first institute
      </Link>
    )
  }

  return (
    <div className="relative">
      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lime" />
      <select
        value={institute?.id ?? ''}
        onChange={(event) => selectInstitute(event.target.value)}
        aria-label="Active institute"
        className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-9 text-sm font-medium text-white outline-none transition-colors focus:border-lime/50"
      >
        {institutes.map((item) => (
          <option
            key={item.id}
            value={item.id}
            className="bg-neutral-900 text-white"
          >
            {isSuperAdmin && item.ownerName
              ? `${item.name} — ${item.ownerName}`
              : item.name}
          </option>
        ))}
      </select>
      <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
    </div>
  )
}
