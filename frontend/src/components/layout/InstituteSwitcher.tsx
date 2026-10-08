import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Check, ChevronsUpDown } from 'lucide-react'
import { useInstitute } from '@/context/InstituteContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function InstituteSwitcher() {
  const { institutes, institute, selectInstitute, isLoading } = useInstitute()
  const { admin } = useAuth()
  const isSuperAdmin = admin?.role === 'superadmin'
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Active institute"
        className={cn(
          'flex w-full items-center gap-2.5 rounded-xl border bg-white/5 py-2.5 pl-3 pr-3 text-left transition-colors',
          open ? 'border-lime/50' : 'border-white/10 hover:border-white/20',
        )}
      >
        <Building2 className="h-4 w-4 shrink-0 text-lime" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
          {institute?.name ?? 'Select institute'}
        </span>
        <ChevronsUpDown
          className={cn(
            'h-4 w-4 shrink-0 text-white/40 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-neutral-900 p-1.5 shadow-2xl shadow-black/50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
          {institutes.map((item) => {
            const isSelected = item.id === institute?.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  selectInstitute(item.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                  isSelected ? 'bg-lime/15' : 'hover:bg-white/5',
                )}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'truncate text-sm font-medium',
                      isSelected ? 'text-lime' : 'text-white',
                    )}
                  >
                    {item.name}
                  </p>
                  {isSuperAdmin && item.ownerName && (
                    <p className="truncate text-xs text-white/40">
                      {item.ownerName}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-lime" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
