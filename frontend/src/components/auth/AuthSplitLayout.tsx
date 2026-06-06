import type { ReactNode } from 'react'
import { GraduationCap } from 'lucide-react'

interface AuthSplitLayoutProps {
  children: ReactNode
}

const avatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
]

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[45%] flex-col justify-between bg-sidebar p-12 lg:flex">
        <div>
          <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-lime/10">
            <GraduationCap className="h-7 w-7 text-lime" />
          </div>

          <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            Empowering Modern Education
          </h2>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60">
            Klass360 provides the ultimate high-density, enterprise-ready
            platform for administrators to manage the student lifecycle with
            precision and clarity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {avatars.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-9 w-9 rounded-full border-2 border-sidebar object-cover"
                style={{ zIndex: avatars.length - i }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-white/50">
            Trusted by 500+ institutions
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-background">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>

        <footer className="flex items-center justify-center gap-6 pb-8 text-sm text-secondary">
          <a href="#" className="transition-colors hover:text-primary">
            Terms of Service
          </a>
          <span className="text-border">·</span>
          <a href="#" className="transition-colors hover:text-primary">
            Privacy Policy
          </a>
          <span className="text-border">·</span>
          <a href="#" className="transition-colors hover:text-primary">
            Support
          </a>
        </footer>
      </div>
    </div>
  )
}
