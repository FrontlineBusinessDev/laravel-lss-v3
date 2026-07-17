import type { MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Minimal accessible toggle switch (role="switch"). Controlled via `checked`;
 * the consumer owns the click handler so it can stopPropagation when embedded
 * in a clickable row. Styled to the app palette (brand on, neutral off).
 */
export function Switch({
  checked,
  onClick,
  label,
  ariaLabel
}: {
  checked: boolean;
  onClick: (e: MouseEvent) => void;
  label?: ReactNode;
  ariaLabel?: string;
}) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={ariaLabel} onClick={onClick} className="flex items-center gap-2 text-xs" data-cy="switch-button-aria-label">
            <span className={cn('relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors', checked ? 'bg-brand-500' : 'bg-neutral-300')} data-cy="switch-span-2">
                <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} data-cy="switch-span-3" />
            </span>
            {label && <span className="text-neutral-600" data-cy="switch-span-4">{label}</span>}
        </button>;
}