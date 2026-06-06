import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <LayoutGrid className="h-5 w-5 text-lime" />
      </div>
      <span className="text-xl font-bold tracking-tight text-primary">
        Klass360
      </span>
    </div>
  )
}
