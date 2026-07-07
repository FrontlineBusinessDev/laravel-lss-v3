import { ButtonHTMLAttributes, forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  size?: 'sm' | 'md'
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 border border-transparent',
  secondary: 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300',
  ghost: 'bg-transparent text-neutral-600 border border-transparent hover:bg-neutral-100',
  danger: 'bg-white text-danger-600 border border-danger-100 hover:bg-danger-50',
}

const SIZE_STYLES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', icon: Icon, iconPosition = 'left', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 ease-out active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className,
        )}
        {...props}
      >
        {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2} />}
        {children}
        {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2} />}
      </button>
    )
  },
)
Button.displayName = 'Button'
