import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: 'default' | 'warning' | 'success' | 'accent'
  hint?: string
  className?: string
}

const TONE_TEXT: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-ink',
  warning: 'text-warning-800',
  success: 'text-success-800',
  accent: 'text-brand-600',
}

export function StatCard({ label, value, icon: Icon, tone = 'default', hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group rounded-lg border border-neutral-200 bg-white p-3.5 transition-colors duration-150 hover:border-neutral-300',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs text-neutral-500">{label}</span>
        {Icon && (
          <Icon size={15} strokeWidth={2} className="text-neutral-400 transition-colors group-hover:text-brand-500" />
        )}
      </div>
      <div className={cn('mt-1.5 text-2xl font-semibold', TONE_TEXT[tone])}>{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
    </div>
  )
}
