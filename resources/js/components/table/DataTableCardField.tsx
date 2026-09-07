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

import { Skeleton } from 'boneyard-js/react';
import React, { useState } from 'react';
import { ConfirmInUseModal } from '@/components/modal/ConfirmInUseModal';
import type { CardActions } from '@/types/reusable/card';
import type { DataTableProps } from '@/types/reusable/data-table';
import { ConfirmDeleteModal } from '../modal/ConfirmDeleteModal';
import FetchingSpinner from '../spinners/FetchingSpinner';
import { CardFilterPanel } from './components/CardFilterPanel';
import { DefaultRecordCard } from './components/DefaultRecordCard';
import { PaginationBar } from './components/Pagination';
import { TableCardsFixture } from './components/TableCardSkeleton';
import { TableRowsFixture } from './components/TableRowSkeleton';
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
        deleteConfirmText,
        bulkActions,
        crossPageBulkActions,
    } = props;

    const c = useCardTableController<T>(props);
    const isTable = c.view === 'table';
    const filterCols = columns.filter((col) => col.filterable);
    const showFiltersButton = filterCols.length > 0 || enableStatusFilter;
    const hasBulkActions = Boolean(bulkActions && bulkActions.length > 0);
    const [bulkStatusScope, setBulkStatusScope] = useState('all');
    const scopedRows =
        bulkStatusScope === 'all'
            ? c.displayRows
            : c.displayRows.filter(
                  (row) => (row as Record<string, unknown>).status === bulkStatusScope,
              );
    const allScopedSelected =
        scopedRows.length > 0 &&
        scopedRows.every((row) => c.selectedKeys.has(c.resolveRowKey(row)));
    const hasCrossPageActions = Boolean(
        crossPageBulkActions && crossPageBulkActions.length > 0,
    );
    const globalScopedCount =
        bulkStatusScope !== 'all' ? c.statusCounts?.[bulkStatusScope] : undefined;
    const showCrossPageBanner =
        hasCrossPageActions &&
        bulkStatusScope !== 'all' &&
        typeof globalScopedCount === 'number' &&
        globalScopedCount > scopedRows.length;

    const rowNodes = c.displayRows.map((row, i) => {
        const content = renderCard ? (
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
        );

        return (
            <React.Fragment key={String(getRowId(row) || i)}>
                {hasBulkActions ? (
                    <div className="flex items-center">
                        <div className="flex w-9 shrink-0 items-center justify-center self-stretch">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={c.selectedKeys.has(c.resolveRowKey(row))}
                                onChange={() => c.toggleRow(row)}
                                aria-label="Select row"
                            />
                        </div>
                        <div className="min-w-0 flex-1">{content}</div>
                    </div>
                ) : (
                    content
                )}
            </React.Fragment>
        );
    });

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
                {hasBulkActions ? (
                    <div className="flex items-center">
                        <div className="w-9 shrink-0" />
                        <div className="min-w-0 flex-1">{listHeader}</div>
                    </div>
                ) : (
                    listHeader
                )}
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

            {hasBulkActions && c.displayRows.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ecedf1] bg-white px-4 py-2.5 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={allScopedSelected}
                                onChange={() =>
                                    allScopedSelected
                                        ? c.clearSelection()
                                        : c.selectByPredicate(
                                              (row) =>
                                                  bulkStatusScope === 'all' ||
                                                  (row as Record<string, unknown>)
                                                      .status === bulkStatusScope,
                                          )
                                }
                                aria-label="Select all matching rows"
                            />
                            Select all
                        </label>
                        <span className="text-xs text-gray-400">
                            (this page only)
                        </span>

                        {statusFilterOptions && statusFilterOptions.length > 0 && (
                            <select
                                value={bulkStatusScope}
                                onChange={(e) => {
                                    setBulkStatusScope(e.target.value);
                                    c.clearSelection();
                                }}
                                className="rounded-lg border border-gray-200 py-1 pl-2 pr-6 text-xs text-gray-700"
                                aria-label="Limit select-all to this status (current page)"
                            >
                                <option value="all">All statuses</option>
                                {statusFilterOptions
                                    .filter((opt) => opt.value !== 'all')
                                    .map((opt) => {
                                        const countOnPage = c.displayRows.filter(
                                            (row) =>
                                                (row as Record<string, unknown>)
                                                    .status === opt.value,
                                        ).length;
                                        const globalCount =
                                            c.statusCounts?.[opt.value];
                                        const label =
                                            typeof globalCount === 'number'
                                                ? `${opt.label} (${globalCount} total)`
                                                : `${opt.label} (${countOnPage} on this page)`;

                                        return (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                                disabled={
                                                    typeof globalCount === 'number'
                                                        ? globalCount === 0
                                                        : countOnPage === 0
                                                }
                                            >
                                                {label}
                                            </option>
                                        );
                                    })}
                            </select>
                        )}
                    </div>

                    {showCrossPageBanner && (
                        <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-800">
                            <span>
                                {globalScopedCount} matching this status across all
                                pages — not just what&apos;s selected here.
                            </span>
                            <div className="flex items-center gap-2">
                                {crossPageBulkActions!.map((action) => (
                                    <button
                                        key={action.label}
                                        type="button"
                                        onClick={async () => {
                                            await action.onRun(bulkStatusScope);
                                            c.clearSelection();
                                        }}
                                        className={
                                            action.variant === 'danger'
                                                ? 'rounded-lg border border-rose-200 bg-white px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-50'
                                                : 'rounded-lg border border-brand-200 bg-white px-3 py-1.5 font-medium text-brand-700 hover:bg-brand-100'
                                        }
                                    >
                                        {action.label} all {globalScopedCount}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {c.selectedKeys.size > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                                {c.selectedKeys.size} selected
                            </span>
                            {bulkActions!.map((action) => (
                                <button
                                    key={action.label}
                                    type="button"
                                    onClick={async () => {
                                        await action.onRun(c.selectedRows);
                                        c.clearSelection();
                                    }}
                                    className={
                                        action.variant === 'danger'
                                            ? 'rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50'
                                            : 'rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50'
                                    }
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

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
                {isEmpty && !c.isLoading ? (
                    isTable ? (
                        listShell(emptyState)
                    ) : (
                        emptyState
                    )
                ) : (
                    listShell(
                        <Skeleton
                            name={isTable ? 'table-rows' : 'table-cards'}
                            loading={c.isLoading && c.displayRows.length === 0}
                            fixture={
                                isTable ? (
                                    <TableRowsFixture />
                                ) : (
                                    <TableCardsFixture />
                                )
                            }
                        >
                            {body}
                        </Skeleton>,
                    )
                )}

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

export default DataTableCardField;
