/**
 * @file components/table/DataTable.tsx
 * Standard-table alternative to <DataTableCardField>: renders a real <table>
 * with sort carets and per-column filter popovers woven directly into the
 * <thead> row, plus a single compact toolbar (search + per-page) inside the
 * same bordered container — no separate filter card sits above the table.
 *
 * Reuses the same behavioral hook (useCardTableController) and DataTableProps
 * contract as DataTableCardField, so callers migrating between the two only
 * change the component name and (optionally) drop card-only props.
 */

import { ArrowDown, ArrowUp, Search, SlidersHorizontal, X } from 'lucide-react';
import React, { useState } from 'react';
import { ConfirmInUseModal } from '@/components/modal/ConfirmInUseModal';
import type { CardActions } from '@/types/reusable/card';
import type { ColumnDef, DataTableProps } from '@/types/reusable/data-table';
import { ConfirmDeleteModal } from '../modal/ConfirmDeleteModal';
import FetchingSpinner from '../spinners/FetchingSpinner';
import { ColumnFilterControl } from './components/ColumnFilterControl';
import { DefaultTableRow } from './components/DefaultTableRow';
import { PaginationBar } from './components/Pagination';
import { useCardTableController } from './hooks/use-card-table-controller';
import { formatCell, getRowId } from './utils';

interface TableHeadCellProps<T> {
    col: ColumnDef<T>;
    sortBy: string;
    sortDir: 'asc' | 'desc';
    onSort: (col: string) => void;
    columnFilters: Record<string, string | string[]>;
    onColumnFilter: (col: string, value: string | string[]) => void;
    activeFilterKey: string | null;
    onToggleFilter: (key: string | null) => void;
}

function isColumnFilterActive(value: string | string[] | undefined): boolean {
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

function TableHeadCell<T>({
    col,
    sortBy,
    sortDir,
    onSort,
    columnFilters,
    onColumnFilter,
    activeFilterKey,
    onToggleFilter,
}: TableHeadCellProps<T>) {
    const isSorted = sortBy === col.key;
    const isFilterOpen = activeFilterKey === col.key;
    const filterActive =
        isColumnFilterActive(columnFilters[col.key]) ||
        isColumnFilterActive(columnFilters[`${col.key}_from`]) ||
        isColumnFilterActive(columnFilters[`${col.key}_to`]);

    return (
        <th
            className="relative px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            style={col.width ? { width: col.width } : undefined}
        >
            <div className="flex items-center gap-1.5">
                {col.sortable !== false ? (
                    <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                        {col.label}
                        {isSorted &&
                            (sortDir === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                            ) : (
                                <ArrowDown className="h-3 w-3" />
                            ))}
                    </button>
                ) : (
                    <span>{col.label}</span>
                )}
                {col.filterable && (
                    <button
                        type="button"
                        onClick={() =>
                            onToggleFilter(isFilterOpen ? null : col.key)
                        }
                        title={`Filter by ${col.label}`}
                        className={`rounded p-0.5 transition-colors ${
                            filterActive || isFilterOpen
                                ? 'text-slate-900'
                                : 'text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        <SlidersHorizontal className="h-3 w-3" />
                    </button>
                )}
            </div>

            {isFilterOpen && (
                <div
                    className="absolute top-full left-0 z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-3 text-left font-normal normal-case shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ColumnFilterControl
                        col={col}
                        columnFilters={columnFilters}
                        onColumnFilter={onColumnFilter}
                    />
                </div>
            )}
        </th>
    );
}

export function DataTable<T extends Record<string, unknown>>(
    props: DataTableProps<T>,
) {
    const { columns, renderCard, deleteConfirmText } = props;
    const c = useCardTableController<T>(props);
    const [activeFilterKey, setActiveFilterKey] = useState<string | null>(
        null,
    );

    const rows = c.displayRows.map((row, i) => (
        <React.Fragment key={String(getRowId(row) || i)}>
            {renderCard ? (
                renderCard(row, {
                    onRestore: () => c.runRestore(row),
                    onArchive: () => c.runArchive(row),
                    onDelete: () => c.requestDelete(row),
                    onEdit: () => c.openEditModal(row),
                    restoring: c.restoring,
                    archiving: c.archiving,
                    canEdit: c.canEdit,
                    canArchive: c.canArchive,
                    canDelete: c.canDelete,
                } satisfies CardActions)
            ) : (
                <DefaultTableRow
                    row={row}
                    columns={columns}
                    canEdit={c.canEdit}
                    canArchive={c.canArchive}
                    canDelete={c.canDelete}
                    restoring={c.restoring}
                    archiving={c.archiving}
                    onEdit={() => c.openEditModal(row)}
                    onArchive={() => c.runArchive(row)}
                    onRestore={() => c.runRestore(row)}
                    onDelete={() => c.requestDelete(row)}
                />
            )}
        </React.Fragment>
    ));

    const isEmpty = c.displayRows.length === 0;

    return (
        <div className="2xl:min-w-7x mx-auto mt-2 w-full">
            <div
                className="overflow-hidden rounded-2xl border border-[#ecedf1] bg-white shadow-sm"
                onClick={() => setActiveFilterKey(null)}
            >
                {/* Toolbar row lives inside the same bordered container as the
                    table — search + per-page only; per-column filters are
                    embedded directly in the <thead> cells below. */}
                <div
                    className="flex flex-col gap-3 border-b border-[#ecedf1] p-3 sm:flex-row sm:items-center sm:justify-between"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative max-w-sm flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            className="w-full rounded-xl border border-slate-200 py-2 pr-9 pl-9 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                            placeholder="Search…"
                            value={c.searchInput}
                            onChange={(e) => c.setSearchInput(e.target.value)}
                        />
                        {c.searchInput && (
                            <button
                                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5"
                                onClick={() => c.setSearchInput('')}
                                aria-label="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {c.hasActiveFilters && (
                            <button
                                onClick={c.clearAllFilters}
                                className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                        <select
                            value={c.perPage}
                            onChange={(e) =>
                                c.setPerPage(Number(e.target.value))
                            }
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-slate-300"
                            title="Rows per page"
                        >
                            {[10, 15, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n} / page
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {c.isError && (
                    <div className="flex items-center justify-between border-b border-rose-200 px-4 py-3 text-sm text-rose-700">
                        <span>⚠ {c.error?.message}</span>
                        <button
                            onClick={() => c.refetch()}
                            className="font-medium underline-offset-2 hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="relative overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-50">
                            <tr>
                                {columns.map((col) => (
                                    <TableHeadCell
                                        key={col.key}
                                        col={col}
                                        sortBy={c.sortBy}
                                        sortDir={c.sortDir}
                                        onSort={c.handleSortBy}
                                        columnFilters={c.columnFilters}
                                        onColumnFilter={c.handleColumnFilter}
                                        activeFilterKey={activeFilterKey}
                                        onToggleFilter={setActiveFilterKey}
                                    />
                                ))}
                                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {c.isLoading && c.displayRows.length === 0 ? (
                                Array.from({ length: 7 }).map((_, i) => (
                                    <tr key={i}>
                                        <td
                                            colSpan={columns.length + 1}
                                            className="px-4 py-3"
                                        >
                                            <div className="h-6 animate-pulse rounded bg-gray-200" />
                                        </td>
                                    </tr>
                                ))
                            ) : isEmpty ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + 1}
                                        className="px-6 py-12 text-center"
                                    >
                                        <p className="text-sm">
                                            No records found.
                                        </p>
                                        {c.hasActiveFilters && (
                                            <button
                                                onClick={c.clearAllFilters}
                                                className="mt-2 text-sm font-medium underline-offset-2 hover:underline"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                rows
                            )}
                        </tbody>
                    </table>
                    {c.isFetching && !c.isLoading && <FetchingSpinner />}
                </div>
            </div>

            {c.meta && (
                <PaginationBar
                    meta={c.meta}
                    page={c.page}
                    loading={c.isFetching}
                    onPageChange={c.setPage}
                />
            )}

            <ConfirmInUseModal
                open={c.inUseTarget !== null}
                recordLabel={
                    c.inUseTarget
                        ? formatCell(c.inUseTarget[columns[0]?.key])
                        : undefined
                }
                usages={c.inUseEntries}
                onClose={c.clearInUse}
            />
            <ConfirmDeleteModal
                open={c.deleteTarget !== null}
                busy={c.deleting}
                label={
                    c.deleteTarget
                        ? formatCell(c.deleteTarget[columns[0]?.key])
                        : undefined
                }
                confirmText={
                    c.deleteTarget
                        ? deleteConfirmText?.(c.deleteTarget)
                        : undefined
                }
                onCancel={() => c.setDeleteTarget(null)}
                onConfirm={c.confirmDelete}
            />
        </div>
    );
}

export default DataTable;
