import type { StatusKind } from '@/types';
import { cn } from '@/lib/utils';
const STATUS_STYLES: Record<StatusKind, string> = {
  active: 'bg-success-50 text-success-800',
  pending: 'bg-warning-50 text-warning-800',
  completed: 'bg-brand-50 text-brand-700',
  terminated: 'bg-danger-50 text-danger-800',
  archived: 'bg-neutral-100 text-neutral-600',
  declined: 'bg-danger-50 text-danger-800',
  dissolved: 'bg-neutral-100 text-neutral-600',
  suspended: 'bg-danger-50 text-danger-800',
  enabled: 'bg-success-50 text-success-800',
  disabled: 'bg-danger-50 text-danger-800'
};
const STATUS_LABELS: Record<StatusKind, string> = {
  active: 'Active',
  pending: 'Pending',
  completed: 'Completed',
  terminated: 'Terminated',
  archived: 'Archived',
  declined: 'Declined',
  dissolved: 'Dissolved',
  suspended: 'Suspended',
  enabled: 'Enabled',
  disabled: 'Disabled'
};
export function StatusBadge({
  status,
  className
}: {
  status: StatusKind;
  className?: string;
}) {
  return <span className={cn('w-fit items-center rounded-pill px-2.5 py-0.5 text-xs leading-5 font-medium', STATUS_STYLES[status], className)} data-cy="status-badge-span-1">
            {STATUS_LABELS[status]}
        </span>;
}