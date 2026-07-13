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
  return <div className={cn('group rounded-lg border border-neutral-200 bg-white p-3.5 transition-colors duration-150 hover:border-neutral-300', className)} data-cy="stat-card-div-1">
      <div className="flex items-start justify-between" data-cy="stat-card-div-2">
        <span className="text-xs text-neutral-500" data-cy="stat-card-span-3">{label}</span>
        {Icon && <Icon size={15} strokeWidth={2} className="text-neutral-400 transition-colors group-hover:text-brand-500" data-cy="stat-card-icon-4" />}
      </div>
      <div className={cn('mt-1.5 text-2xl font-semibold', TONE_TEXT[tone])} data-cy="stat-card-div-5">{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500" data-cy="stat-card-div-6">{hint}</div>}
    </div>;
}