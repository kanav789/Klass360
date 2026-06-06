import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-lime text-primary hover:bg-lime-hover active:scale-[0.98]',
        secondary:
          'border border-border bg-card text-primary hover:bg-background hover:shadow-sm',
        ghost: 'text-secondary hover:bg-background hover:text-primary',
        sidebar:
          'w-full justify-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white',
        sidebarActive:
          'w-full justify-start gap-3 rounded-xl bg-lime px-4 py-3 text-sm font-semibold text-primary',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
