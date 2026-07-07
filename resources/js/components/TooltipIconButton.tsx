import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TooltipIconButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  danger?: boolean
  disabled?: boolean
}

export function TooltipIconButton({ icon: Icon, label, onClick, danger, disabled }: TooltipIconButtonProps) {
  return (
    <div className="group/tip relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40',
          danger && 'hover:bg-danger-50 hover:text-danger-600',
        )}
      >
        <Icon size={14} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-popover transition-opacity duration-100 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </div>
  )
}
