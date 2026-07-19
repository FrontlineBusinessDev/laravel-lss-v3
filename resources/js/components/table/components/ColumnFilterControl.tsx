/**
 * @file components/table/components/ColumnFilterControl.tsx
 * Renders the correct filter input for a single column, based on its
 * `type`/`typeData`/`loadOptions`. Extracted from CardFilterPanel's per-column
 * switch so it can be reused both there and by <DataTable>'s inline per-column
 * header popovers, without duplicating the type-dispatch logic.
 */

import { AsyncMultiSelectField } from '@/hooks/use-async-multi-select-field';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import type { ColumnDef } from '@/types/reusable/data-table';
import { Dropdown } from '../../Dropdown';

interface ColumnFilterControlProps<T> {
    col: ColumnDef<T>;
    columnFilters: Record<string, string | string[]>;
    onColumnFilter: (col: string, value: string | string[]) => void;
}

export function ColumnFilterControl<T>({
    col,
    columnFilters,
    onColumnFilter,
}: ColumnFilterControlProps<T>) {
    if (col.type === 'select' && col.typeData) {
        const selectValue = columnFilters[col.key];

        return (
            <Dropdown
                options={col.typeData as { label: string; value: string }[]}
                value={typeof selectValue === 'string' ? selectValue : ''}
                onChange={(value) => onColumnFilter(col.key, value)}
            />
        );
    }

    if (col.type === 'async-multi-select' && col.loadOptions) {
        const raw = columnFilters[col.key];
        const arrValue = Array.isArray(raw) ? raw : [];

        return (
            <AsyncMultiSelectField
                value={arrValue}
                placeholder="All"
                loadOptions={col.loadOptions}
                onChange={(v) => {
                    onColumnFilter(col.key, v);
                    (col.filterResets ?? []).forEach((k) =>
                        onColumnFilter(k, ''),
                    );
                }}
            />
        );
    }

    if (col.type === 'date-range') {
        const fromKey = `${col.key}_from`;
        const toKey = `${col.key}_to`;
        const fromValue = columnFilters[fromKey];
        const toValue = columnFilters[toKey];

        return (
            <div className="flex items-center gap-1.5">
                <input
                    type="date"
                    value={typeof fromValue === 'string' ? fromValue : ''}
                    onChange={(e) => onColumnFilter(fromKey, e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                    data-cy={`data-input-${fromKey}`}
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                    type="date"
                    value={typeof toValue === 'string' ? toValue : ''}
                    onChange={(e) => onColumnFilter(toKey, e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                    data-cy={`data-input-${toKey}`}
                />
            </div>
        );
    }

    if (col.type === 'async-select' && col.loadOptions) {
        const loadWithAll = async (q: string) => [
            { value: '', label: 'All' },
            ...(await col.loadOptions!(q)),
        ];
        const asyncValue = columnFilters[col.key];

        return (
            <AsyncSelectField
                value={typeof asyncValue === 'string' ? asyncValue : ''}
                placeholder="All"
                loadOptions={loadWithAll}
                onChange={(v) => {
                    onColumnFilter(col.key, (v as string) ?? '');
                    (col.filterResets ?? []).forEach((k) =>
                        onColumnFilter(k, ''),
                    );
                }}
            />
        );
    }

    const textValue = columnFilters[col.key];

    return (
        <input
            type="text"
            value={typeof textValue === 'string' ? textValue : ''}
            onChange={(e) => onColumnFilter(col.key, e.target.value)}
            placeholder={`Filter by ${col.label.toLowerCase()}…`}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
            data-cy={`data-input-${col.key}`}
        />
    );
}

export default ColumnFilterControl;
