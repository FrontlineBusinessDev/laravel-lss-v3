import { cn } from '@/lib/utils';
import { GRID } from '@/types/reusable/data-table';

/**
 * Shared header row for settings list tables.
 *
 * Renders the muted, hidden-on-mobile column labels plus the trailing (empty)
 * actions column, using the standard `GRID` base with an optional per-module
 * column-template override — the exact markup every settings page duplicated.
 */
export function SettingsListHeader({
  grid,
  labels
}: {
  grid?: string;
  labels: string[];
}) {
  return <div className={cn(GRID, grid, 'hidden bg-neutral-50 px-4 py-2.5 text-xs font-medium text-neutral-500')} data-cy="settings-list-header-div-1">
            {labels.map(label => <span key={label} data-cy="settings-list-header-span-2">{label}</span>)}
            <span data-cy="settings-list-header-span-3" />
        </div>;
}