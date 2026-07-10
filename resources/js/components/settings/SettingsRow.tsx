import type { ReactNode } from 'react';
import type { RowMenuAction } from '@/components/RowMenu';
import { RowMenu } from '@/components/RowMenu';
import { cn } from '@/lib/utils';
import { GRID } from '@/types/reusable/data-table';

/**
 * Atomic cell for a settings list row.
 *
 * Default is the emphasized ink text used for primary columns; `muted` switches
 * to the smaller neutral style used for secondary details (e.g. a contact's
 * name or email on the partner-schools list).
 */
export function TextCell({
    children,
    muted = false,
}: {
    children: ReactNode;
    muted?: boolean;
}) {
    if (muted) {
        return (
            <div className="truncate text-xs text-neutral-500">{children}</div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 font-medium text-ink">
            <span className="truncate">{children}</span>
        </div>
    );
}

/**
 * Shared row shell for settings list tables: the grid wrapper (with archived
 * dimming), the caller's data cells, and the standard status + actions cell
 * (`StatusBadge` slot + `RowMenu`). Keeps the `cn(GRID, grid, …)` composition
 * order so a per-module column-template override wins exactly as before.
 */
export function SettingsRow({
    grid,
    isArchived = false,
    badge,
    menu,
    children,
}: {
    grid?: string;
    isArchived?: boolean;
    badge: ReactNode;
    menu: RowMenuAction[];
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-1 px-4 py-3',
                GRID,
                grid,
                isArchived && 'opacity-60',
            )}
        >
            {children}
            <div className="flex items-center justify-between sm:contents">
                {badge}
                <div className="sm:justify-self-end">
                    <RowMenu actions={menu} />
                </div>
            </div>
        </div>
    );
}
