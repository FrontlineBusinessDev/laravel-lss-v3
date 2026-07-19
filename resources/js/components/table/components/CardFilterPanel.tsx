/**
 * @file components/table/components/CardFilterPanel.tsx
 * The column/status filter panel for <DataTableCardField>. Presentational —
 * receives the current filter values + change handlers. Extracted verbatim from
 * DataTableCardField (markup/behavior unchanged) to keep the orchestrator lean.
 */

import { AsyncMultiSelectField } from '@/hooks/use-async-multi-select-field';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import type { ColumnDef } from '@/types/reusable/data-table';
import { Dropdown } from '../../Dropdown';
import { StatusFilter, StatusFilterTab } from './StatusFilter';

interface CardFilterPanelProps<T> {
    filterCols: ColumnDef<T>[];
    enableStatusFilter: boolean;
    statusScope: string;
    columnFilters: Record<string, string | string[]>;
    statusFilterOptions?: StatusFilterTab[];
    onStatusChange: (scope: string) => void;
    onColumnFilter: (col: string, value: string | string[]) => void;
}

export function CardFilterPanel<T>({
    filterCols,
    enableStatusFilter,
    statusScope,
    columnFilters,
    onStatusChange,
    onColumnFilter,
    statusFilterOptions,
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
                        tabs={statusFilterOptions}
                    />
                </div>
            )}
            {filterCols.length > 0 && (
                <div
                    // className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
                    className="flex flex-wrap items-center gap-3"
                >
                    {filterCols.map((col, i) => {
                        if (col.type == 'select' && col.typeData) {
                            const selectValue = columnFilters[col.key];

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
                                        value={
                                            typeof selectValue === 'string'
                                                ? selectValue
                                                : ''
                                        }
                                        onChange={(value) =>
                                            onColumnFilter(col.key, value)
                                        }
                                    />
                                </div>
                            );
                        }

                        if (
                            col.type === 'async-multi-select' &&
                            col.loadOptions
                        ) {
                            const raw = columnFilters[col.key];
                            const arrValue = Array.isArray(raw) ? raw : [];

                            return (
                                <label key={col.key} className="block min-w-50">
                                    <span className="mb-1 block text-xs font-medium">
                                        {col.label}
                                    </span>
                                    <AsyncMultiSelectField
                                        value={arrValue}
                                        placeholder="All"
                                        loadOptions={col.loadOptions}
                                        onChange={(v) => {
                                            onColumnFilter(col.key, v);
                                            (col.filterResets ?? []).forEach(
                                                (k) => onColumnFilter(k, ''),
                                            );
                                        }}
                                    />
                                </label>
                            );
                        }

                        if (col.type === 'date-range') {
                            const fromKey = `${col.key}_from`;
                            const toKey = `${col.key}_to`;
                            const fromValue = columnFilters[fromKey];
                            const toValue = columnFilters[toKey];

                            return (
                                <label key={col.key} className="block min-w-50">
                                    <span className="mb-1 block text-xs font-medium">
                                        {col.label}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="date"
                                            value={
                                                typeof fromValue === 'string'
                                                    ? fromValue
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                onColumnFilter(
                                                    fromKey,
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                                            data-cy={`data-input-${fromKey}`}
                                        />
                                        <span className="text-xs text-slate-400">
                                            to
                                        </span>
                                        <input
                                            type="date"
                                            value={
                                                typeof toValue === 'string'
                                                    ? toValue
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                onColumnFilter(
                                                    toKey,
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                                            data-cy={`data-input-${toKey}`}
                                        />
                                    </div>
                                </label>
                            );
                        }

                        if (col.type === 'async-select' && col.loadOptions) {
                            const loadWithAll = async (q: string) => [
                                { value: '', label: 'All' },
                                ...(await col.loadOptions!(q)),
                            ];
                            const asyncValue = columnFilters[col.key];

                            return (
                                <label key={col.key} className="block min-w-50">
                                    <span className="mb-1 block text-xs font-medium">
                                        {col.label}
                                    </span>
                                    <AsyncSelectField
                                        value={
                                            typeof asyncValue === 'string'
                                                ? asyncValue
                                                : ''
                                        }
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

                        const textValue = columnFilters[col.key];

                        return (
                            <label key={col.key} className="block">
                                <span className="mb-1 block text-xs font-medium">
                                    {col.label}
                                </span>
                                <input
                                    type="text"
                                    value={
                                        typeof textValue === 'string'
                                            ? textValue
                                            : ''
                                    }
                                    onChange={(e) =>
                                        onColumnFilter(col.key, e.target.value)
                                    }
                                    placeholder={`Filter by ${col.label.toLowerCase()}…`}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
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
