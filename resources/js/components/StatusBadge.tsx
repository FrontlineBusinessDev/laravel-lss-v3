import type { StatusKind } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<StatusKind, string> = {
  active: 'bg-success-50 text-success-800',
  pending: 'bg-warning-50 text-warning-800',
  completed: 'bg-brand-50 text-brand-700',
  terminated: 'bg-danger-50 text-danger-800',
  archived: 'bg-neutral-100 text-neutral-600',
  declined: 'bg-danger-50 text-danger-800',
  dissolved: 'bg-neutral-100 text-neutral-600',
  suspended: 'bg-danger-50 text-danger-800',
}

const STATUS_LABELS: Record<StatusKind, string> = {
  active: 'Active',
  pending: 'Pending',
  completed: 'Completed',
  terminated: 'Terminated',
  archived: 'Archived',
  declined: 'Declined',
  dissolved: 'Dissolved',
  suspended: 'Suspended',
}

export function StatusBadge({ status, className }: { status: StatusKind; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium leading-5 whitespace-nowrap',
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
