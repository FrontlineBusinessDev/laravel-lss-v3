/**
 * @file components/table/components/CardFilterPanel.tsx
 * The column/status filter panel for <DataTableCardField>. Presentational —
 * receives the current filter values + change handlers. Extracted verbatim from
 * DataTableCardField (markup/behavior unchanged) to keep the orchestrator lean.
 */

import { AsyncSelectField } from '@/hooks/use-async-select-field';
import type { ColumnDef } from '@/types/reusable/data-table';
import { Dropdown } from '../../Dropdown';
import { StatusFilter } from './StatusFilter';

interface CardFilterPanelProps<T> {
    filterCols: ColumnDef<T>[];
    enableStatusFilter: boolean;
    statusScope: string;
    columnFilters: Record<string, string>;
    onStatusChange: (scope: string) => void;
    onColumnFilter: (col: string, value: string) => void;
}

export function CardFilterPanel<T>({
    filterCols,
    enableStatusFilter,
    statusScope,
    columnFilters,
    onStatusChange,
    onColumnFilter,
}: CardFilterPanelProps<T>) {
    return (
        <div className="mt-3 space-y-4 rounded-xl border border-slate-200 p-4">
            {enableStatusFilter && (
                <div>
                    <span className="mb-1.5 block text-xs font-medium">
                        Status
                    </span>
                    <StatusFilter
                        value={statusScope}
                        onChange={onStatusChange}
                    />
                </div>
            )}
            {filterCols.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                    {filterCols.map((col, i) => {
                        if (col.type == 'select' && col.typeData) {
                            return (
                                <div className="relative block" key={i}>
                                    <label
                                        htmlFor={col.label}
                                        className="mb-1 block text-xs font-medium"
                                    >
                                        {col.label}
                                    </label>
                                    <Dropdown
                                        options={
                                            col.typeData as {
                                                label: string;
                                                value: string;
                                            }[]
                                        }
                                        value={columnFilters[col.key] ?? ''}
                                        onChange={(value) =>
                                            onColumnFilter(col.key, value)
                                        }
                                    />
                                </div>
                            );
                        }

                        if (col.type === 'async-select' && col.loadOptions) {
                            const loadWithAll = async (q: string) => [
                                { value: '', label: 'All' },
                                ...(await col.loadOptions!(q)),
                            ];

                            return (
                                <label key={col.key} className="block">
                                    <span className="mb-1 block text-xs font-medium">
                                        {col.label}
                                    </span>
                                    <AsyncSelectField
                                        value={columnFilters[col.key] ?? ''}
                                        placeholder="All"
                                        loadOptions={loadWithAll}
                                        onChange={(v) => {
                                            onColumnFilter(
                                                col.key,
                                                (v as string) ?? '',
                                            );
                                            (col.filterResets ?? []).forEach(
                                                (k) => onColumnFilter(k, ''),
                                            );
                                        }}
                                    />
                                </label>
                            );
                        }

                        return (
                            <label key={col.key} className="block">
                                <span className="mb-1 block text-xs font-medium">
                                    {col.label}
                                </span>
                                <input
                                    type="text"
                                    value={columnFilters[col.key] ?? ''}
                                    onChange={(e) =>
                                        onColumnFilter(col.key, e.target.value)
                                    }
                                    placeholder={`Filter by ${col.label.toLowerCase()}…`}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                                    data-cy={`data-input-${col.key}`}
                                />
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CardFilterPanel;
