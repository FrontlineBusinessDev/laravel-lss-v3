import type { LucideIcon } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { cn } from '@/lib/utils';
interface TooltipIconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}
export function TooltipIconButton({
  icon: Icon,
  label,
  onClick,
  danger,
  disabled
}: TooltipIconButtonProps) {
  return <Tooltip label={label}>
      <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className={cn('rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40', danger && 'hover:bg-danger-50 hover:text-danger-600')} data-cy="tooltip-icon-button-button-label">
        <Icon size={14} data-cy="tooltip-icon-button-icon-3" />
      </button>
    </Tooltip>;
}