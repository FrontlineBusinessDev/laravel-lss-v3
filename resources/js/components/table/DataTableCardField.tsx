/**
 * @file components/table/DataTableCardField.tsx
 * Reusable read/list surface: server- or client-paginated, with debounced
 * global search + column filters, a Table/Card view toggle, and optional
 * custom rendering via `children`.
 *
 * Logic lives in hooks/use-card-table-controller.ts; presentation is delegated
 * to components/{DefaultRecordCard,CardFilterPanel,ViewToggle,Toolbar,Pagination}.
 *
 * children behavior:
 *   - table view: column headers (listHeader) stay, children render as rows
 *   - card view : all table chrome/headers hidden, only children render
 */

import React from 'react';
import { ConfirmInUseModal } from '@/components/modal/ConfirmInUseModal';
import type { CardActions } from '@/types/reusable/card';
import type { DataTableProps } from '@/types/reusable/data-table';
import { ConfirmDeleteModal } from '../modal/ConfirmDeleteModal';
import FetchingSpinner from '../spinners/FetchingSpinner';
import { CardFilterPanel } from './components/CardFilterPanel';
import { DefaultRecordCard } from './components/DefaultRecordCard';
import { PaginationBar } from './components/Pagination';
import { StatusFilter } from './components/StatusFilter';
import { Toolbar } from './components/Toolbar';
import { ViewToggle } from './components/ViewToggle';
import { useCardTableController } from './hooks/use-card-table-controller';
import { formatCell, getRowId } from './utils';

export function DataTableCardField<T extends Record<string, unknown>>(
    props: DataTableProps<T>,
) {
    const {
        columns,
        renderCard,
        enableStatusFilter = false,
        statusFilterOptions,
        listHeader,
        enableViewToggle = false,
        children,
    } = props;

    const c = useCardTableController<T>(props);
    const isTable = c.view === 'table';
    const filterCols = columns.filter((col) => col.filterable);
    const showFiltersButton = filterCols.length > 0 || enableStatusFilter;

    const rowNodes = c.displayRows.map((row, i) => (
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
                <DefaultRecordCard
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

    const skeletonNodes = Array.from({ length: 7 }).map((_, i) =>
        isTable ? (
            <div key={i} className="h-16 animate-pulse bg-gray-400/50" />
        ) : (
            <div
                key={i}
                className="h-22 animate-pulse rounded-2xl border border-slate-200 bg-gray-300/40 dark:bg-gray-300/80"
            />
        ),
    );

    const emptyState = (
        <div
            className={
                isTable
                    ? 'px-6 py-12 text-center'
                    : 'rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center'
            }
        >
            <p className="text-sm">No records found.</p>
            {c.hasActiveFilters && (
                <button
                    onClick={c.clearAllFilters}
                    className="mt-2 text-sm font-medium underline-offset-2 hover:underline"
                >
                    Clear filters
                </button>
            )}
        </div>
    );

    // Table view keeps the column headers; card view drops all table chrome.
    const listShell = (content: React.ReactNode) =>
        isTable ? (
            <div className="overflow-hidden rounded-2xl border border-[#ecedf1] bg-white shadow-sm">
                {listHeader}
                <div className="divide-y divide-gray-100">{content}</div>
            </div>
        ) : (
            <div className="space-y-3">{content}</div>
        );

    const body = children ?? rowNodes;
    const isEmpty = !children && c.displayRows.length === 0;

    return (
        <div className="2xl:min-w-7x mx-auto mt-2 w-full">
            {/* {statusFilterOptions && statusFilterOptions.length > 0 && (
                <div className="mb-4">
                    <StatusFilter
                        value={c.customStatusScope}
                        onChange={c.handleStatusChange}
                        tabs={statusFilterOptions}
                    />
                </div>
            )} */}

            {enableViewToggle && (
                <div className="mb-3 flex justify-end">
                    <ViewToggle value={c.view} onChange={c.setView} />
                </div>
            )}

            <Toolbar
                columns={columns}
                searchInput={c.searchInput}
                onSearchChange={c.setSearchInput}
                searchableCols={[]}
                sortBy={c.sortBy}
                sortDir={c.sortDir}
                onSortByChange={c.handleSortBy}
                onSortDirToggle={() =>
                    c.setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                }
                perPage={c.perPage}
                onPerPageChange={c.setPerPage}
                filtersOpen={c.filtersOpen}
                onFiltersToggle={() => c.setFiltersOpen((o) => !o)}
                hasActiveColumnFilters={c.hasActiveColumnFilters}
                showFiltersButton={showFiltersButton}
                filterPanel={
                    <CardFilterPanel
                        filterCols={filterCols}
                        enableStatusFilter={enableStatusFilter}
                        statusScope={c.statusScope}
                        columnFilters={c.columnFilters}
                        onStatusChange={c.handleStatusChange}
                        onColumnFilter={c.handleColumnFilter}
                        statusFilterOptions={statusFilterOptions}
                    />
                }
            />

            {c.hasActiveFilters && (
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs">Filters applied</span>
                    <button
                        onClick={c.clearAllFilters}
                        className="text-xs font-medium underline-offset-2 hover:underline"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {c.isError && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 px-4 py-3 text-sm text-rose-700">
                    <span>⚠ {c.error?.message}</span>
                    <button
                        onClick={() => c.refetch()}
                        className="font-medium underline-offset-2 hover:underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="relative">
                {c.isLoading && c.displayRows.length === 0
                    ? listShell(skeletonNodes)
                    : isEmpty
                      ? isTable
                          ? listShell(emptyState)
                          : emptyState
                      : listShell(body)}

                {c.isFetching && !c.isLoading && <FetchingSpinner />}
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
                onCancel={() => c.setDeleteTarget(null)}
                onConfirm={c.confirmDelete}
            />
        </div>
    );
}

export default DataTableCardField;
