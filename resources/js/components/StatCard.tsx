import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: 'default' | 'warning' | 'success' | 'accent';
  hint?: string;
  className?: string;
}
const TONE_TEXT: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-ink',
  warning: 'text-warning-800',
  success: 'text-success-800',
  accent: 'text-brand-600'
};
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  hint,
  className
}: StatCardProps) {
  return <div className={cn('group min-w-0 rounded-lg border border-neutral-200 bg-white p-3.5 transition-colors duration-150 hover:border-neutral-300', className)} data-cy="stat-card-div-1">
      <div className="flex items-start justify-between gap-2" data-cy="stat-card-div-2">
        <span className="min-w-0 truncate text-xs text-neutral-500" data-cy="stat-card-span-3">{label}</span>
        {Icon && <Icon size={15} strokeWidth={2} className="shrink-0 text-neutral-400 transition-colors group-hover:text-brand-500" data-cy="stat-card-icon-4" />}
      </div>
      <div className={cn('mt-1.5 truncate text-lg font-semibold sm:text-xl', TONE_TEXT[tone])} title={String(value)} data-cy="stat-card-div-5">{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500" data-cy="stat-card-div-6">{hint}</div>}
    </div>;
}