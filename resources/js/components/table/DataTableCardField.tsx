/**
 * @file DataTableField.tsx
 * Root orchestrator — wires hooks, state, and sub-components together.
 *
 * This file intentionally contains NO business logic of its own.
 * Every concern is delegated:
 *
 * Data fetching  →  hooks/index.ts  (useTableQuery, useInvalidateTable)
 * URL building   →  utils/index.ts  (buildRestoreUrl, buildArchiveUrl …)
 * Formatting     →  utils/index.ts  (formatCell, deriveFieldsFromColumns …)
 * Pagination UI  →  components/Pagination.tsx
 * Toolbar UI     →  components/Toolbar.tsx
 * Edit           →  components/RecordModal.tsx
 * Delete confirm →  components/ConfirmDeleteModal.tsx
 * Types          →  types/index.ts
 *
 * See types/index.ts → DataTableProps for the full prop surface.
 */

import type { InUseEntry } from '@/components/modal/ConfirmInUseModal';
import { ConfirmInUseModal } from '@/components/modal/ConfirmInUseModal';
import { useAsyncAction } from '@/hooks/use-async-action';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { useCrud } from '@/hooks/use-crud';
import { usePermission } from '@/hooks/use-permissions';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/apiFetch';
import { parseApiError } from '@/lib/parseApiError';
import type { CardActions } from '@/types/reusable/card';
import type { DataTableProps } from '@/types/reusable/data-table';
import type { ModalMode } from '@/types/reusable/fields';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, ArchiveRestore, Loader2, Pencil, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown } from '../Dropdown';
import { ConfirmDeleteModal } from '../modal/ConfirmDeleteModal';
import FetchingSpinner from '../spinners/FetchingSpinner';
import { PaginationBar } from './components/Pagination';
import { StatusFilter } from './components/StatusFilter';
import { Toolbar } from './components/Toolbar';
import { useDebouncedValue, useTableRefresh } from './hooks';
import {
    buildArchiveUrl,
    buildDeleteUrl,
    buildRestoreUrl,
    deriveFieldsFromColumns,
    formatCell,
    getRowId,
} from './utils';

/**
 * Normalizes the caller-supplied `apiQueryKey` into a stable string array.
 */
function normalizeQueryKey(apiQueryKey: string | string[]): string[] {
    return Array.isArray(apiQueryKey)
        ? apiQueryKey.map(String)
        : [String(apiQueryKey)];
}

/**
 * Deep-scans a save payload for an actual File/Blob so the progress bar only
 * appears for real uploads.
 */
function containsFile(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
        return false;
    }

    if (value instanceof File || value instanceof Blob) {
        return true;
    }

    return Object.values(value as Record<string, unknown>).some(containsFile);
}

export function DataTableCardField<T extends Record<string, unknown>>({
    apiUrl,
    apiQueryKey,
    columns,
    fields,
    title,
    description,
    actions,
    renderCard,
    renderModal,
    updateUrl,
    updateMethod = 'PUT',
    enableEdit,
    restoreUrl,
    archiveUrl,
    deleteUrl,
    modalTitle,
    onRestore,
    onArchive,
    onSuspend,
    onDelete,
    onUpdated,
    onSaveError,
    onRefreshRef,
    inUseCheck,
    enableSuspend = false,
    enableStatusFilter = false,
    statusFilterOptions,
    extraFilters,
    listHeader,
    defaultSortBy,
    defaultSortDir,
    editPermission,
    archivePermission,
    deletePermission,
}: DataTableProps<T>) {
    const { can } = usePermission();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Single, stable cache key for this resource.
    const queryKey = useMemo(
        () => normalizeQueryKey(apiQueryKey),
        [apiQueryKey],
    );

    // Invalidate every cached page/sort/filter variant of the list so it refetches after a mutation.
    const invalidateTable = useCallback(
        () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
        [queryClient, queryKey],
    );

    // ── Toolbar state ─────────────────────────────────────────────────────────
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
        {},
    );

    // ── InUse state ───────────────────────────────────────────────────────────
    const [inUseTarget, setInUseTarget] = useState<T | null>(null);
    const [inUseEntries, setInUseEntries] = useState<InUseEntry[]>([]);
    const [sortBy, setSortBy] = useState<string>(
        defaultSortBy ?? columns[0]?.key ?? 'id',
    );
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(
        defaultSortDir ?? 'asc',
    );
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Real upload progress (0–100) for update requests carrying files
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    // Debounce free-text inputs so the query only fires after the user pauses
    const debouncedSearch = useDebouncedValue(searchInput, 350);
    const debouncedFilters = useDebouncedValue(columnFilters, 350);
    const extraFiltersKey = JSON.stringify(extraFilters ?? {});

    // Reset to page 1 whenever the search or filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [debouncedSearch, debouncedFilters, extraFiltersKey, perPage]);

    // ── Data fetching ─────────────────────────────────────────────────────────
    const crud = useCrud<T>({
        baseUrl: apiUrl,
        baseUrlPaginationSearch: '/pagination-search',
        queryKey,
        queryParams: {
            page,
            per_page: perPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_dir: sortDir,
            filters: { ...debouncedFilters, ...(extraFilters ?? {}) },
        },
        updateUrl: ({ id }) => {
            if (updateUrl) {
                return updateUrl(modalState?.row as T);
            }
            return `${apiUrl}/${id}`;
        },
        deleteUrl: deleteUrl
            ? (id) => deleteUrl({ id } as unknown as T)
            : undefined,
        archiveUrl: archiveUrl
            ? (id) => archiveUrl({ id } as unknown as T)
            : undefined,
        restoreUrl: restoreUrl
            ? (id) => restoreUrl({ id } as unknown as T)
            : undefined,
        updateMethod,
        onUploadProgress: setUploadProgress,
    });

    const rows = crud.data;
    const meta = crud.pageInfo;
    const filterableCols: string[] = [];
    const searchableCols: string[] = [];
    const isLoading = crud.isLoading;
    const isFetching = crud.isFetching;
    const isError = crud.list.isError;
    const error = crud.list.error as Error | null;
    const refetch = crud.list.refetch;

    // Expose refetch to the parent via the escape-hatch ref
    useTableRefresh(refetch, onRefreshRef);

    // ── Fields ────────────────────────────────────────────────────────────────
    const resolvedFields = useMemo(
        () => fields ?? deriveFieldsFromColumns(columns),
        [fields, columns],
    );

    // Gate each feature behind permission check
    const canEdit =
        (enableEdit ?? resolvedFields.length > 0) &&
        (editPermission ? can(editPermission) : true);

    const canArchive = archivePermission ? can(archivePermission) : true;
    const canDelete = deletePermission ? can(deletePermission) : true;

    // ── Modal state ───────────────────────────────────────────────────────────
    const [modalState, setModalState] = useState<{
        mode: ModalMode;
        row?: T;
    } | null>(null);

    const openEditModal = (row: T) => {
        setModalState({ mode: 'edit', row });
        setModalError(null);
        setUploadProgress(null);
    };

    // ── Delete confirmation state ─────────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSortByChange = (col: string) => {
        if (sortBy === col) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(col);
            setSortDir('asc');
        }
        setPage(1);
    };
    const handleColumnFilter = (col: string, value: string) => {
        setColumnFilters((prev) => ({ ...prev, [col]: value }));
    };
    const statusScope: string = columnFilters.status ?? 'all';
    const customStatusScope: string = columnFilters.status ?? '';
    const handleStatusChange = (scope: string) => {
        setColumnFilters((prev) => {
            const next = { ...prev };
            if (scope === 'all' || scope === '') {
                delete next.status;
            } else {
                next.status = scope;
            }
            return next;
        });
    };
    const clearAllFilters = () => {
        setSearchInput('');
        setColumnFilters({});
        setPage(1);
    };
    const hasActiveFilters =
        Boolean(searchInput) || Object.values(columnFilters).some(Boolean);
    const hasActiveColumnFilters = Object.values(columnFilters).some(Boolean);
    // ── Archive / Restore / Delete ────────────────────────────────────────────
    const handleRestore = async (row: T) => {
        try {
            if (onRestore) {
                await onRestore(row, buildRestoreUrl(row, apiUrl, restoreUrl));
            } else {
                await crud.restore.mutateAsync(String(getRowId(row)));
            }
            invalidateTable();
            toast({ title: 'Restored', variant: 'info' });
        } catch (err) {
            const error =
                err instanceof Error ? err : new Error('Failed to restore.');
            toast({
                title: 'Restore failed',
                description: error.message,
                variant: 'error',
            });
        }
    };

    const handleArchive = async (row: T) => {
        try {
            if (onArchive) {
                await onArchive(row, buildArchiveUrl(row, apiUrl, archiveUrl));
            } else {
                await crud.archive.mutateAsync(String(getRowId(row)));
            }
            invalidateTable();
            toast({ title: 'Archived', variant: 'info' });
        } catch (err) {
            const error =
                err instanceof Error ? err : new Error('Failed to archive.');
            toast({
                title: 'Archive failed',
                description: error.message,
                variant: 'error',
            });
        }
    };
    const { run: runRestore, loading: restoring } =
        useAsyncAction(handleRestore);
    const { run: runArchive, loading: archiving } =
        useAsyncAction(handleArchive);
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await apiFetch(
                buildDeleteUrl(deleteTarget, apiUrl, deleteUrl),
                { method: 'DELETE' },
            );
            if (!res.ok) {
                const apiError = await parseApiError(res);
                if (apiError.inUse && apiError.inUse.some((e) => e.count > 0)) {
                    setInUseEntries(apiError.inUse);
                    setInUseTarget(deleteTarget);
                    setDeleteTarget(null);
                    return;
                }
                toast({
                    title: 'Delete failed',
                    description: apiError.message,
                    variant: 'error',
                });
                return;
            }
            await onDelete?.(
                deleteTarget,
                buildDeleteUrl(deleteTarget, apiUrl, deleteUrl),
            );
            invalidateTable();
            toast({ title: 'Deleted', variant: 'info' });
            setDeleteTarget(null);
        } catch (err) {
            const error =
                err instanceof Error ? err : new Error('Failed to delete.');
            toast({
                title: 'Delete failed',
                description: error.message,
                variant: 'error',
            });
        } finally {
            setDeleting(false);
        }
    };

    // ── Default card (used when renderCard prop is not supplied) ──────────────
    const defaultCard = (row: T | any) => {
        const [titleCol, ...rest] = columns;

        return (
            <div className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold">
                        {formatCell(row[titleCol?.key])}
                    </h3>
                    <dl className="mt-1 space-y-0.5">
                        {rest.map((col) => {
                            const value = col.render
                                ? col.render(row[col.key], row)
                                : formatCell(row[col.key]);

                            if (
                                value === '—' ||
                                value === '' ||
                                value == null
                            ) {
                                return null;
                            }

                            return (
                                <dd key={col.key} className="truncate text-sm">
                                    {value}
                                </dd>
                            );
                        })}
                    </dl>
                </div>
                <div className="flex shrink-0 items-center gap-3 pt-0.5">
                    {(row as Record<string, unknown>).status === 'active' ? (
                        <>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => openEditModal(row)}
                                    title="Edit"
                                    className="rounded-md p-1.5 transition-colors hover:bg-slate-100 hover:dark:bg-slate-100/30"
                                >
                                    <Pencil
                                        className="size-4.5"
                                        strokeWidth={1.75}
                                    />
                                </button>
                            )}
                            {canArchive && (
                                <button
                                    type="button"
                                    onClick={() => runArchive(row)}
                                    disabled={archiving}
                                    title="Archive"
                                    className="rounded-md p-1.5 transition-colors hover:bg-slate-100 hover:dark:bg-slate-100/30"
                                >
                                    {archiving ? (
                                        <Loader2 className="size-4.5 animate-spin" />
                                    ) : (
                                        <Archive
                                            className="size-4.5"
                                            strokeWidth={1.75}
                                        />
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => runRestore(row)}
                                disabled={restoring}
                                title="Restore"
                                className="rounded-md p-1.5 transition-colors hover:bg-yellow-100 hover:text-yellow-700"
                            >
                                {restoring ? (
                                    <Loader2 className="size-4.5 animate-spin" />
                                ) : (
                                    <ArchiveRestore
                                        className="size-4.5"
                                        strokeWidth={1.75}
                                    />
                                )}
                            </button>
                            {canDelete && (
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(row)}
                                    title="Delete"
                                    className="rounded-md p-1.5 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                >
                                    <Trash2
                                        className="size-4.5"
                                        strokeWidth={1.75}
                                    />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    };

    // ── Filter panel ───────────────────────────────────────────────────────────
    const filterCols = columns.filter(
        (c) => c.filterable || filterableCols.includes(c.key),
    );
    const showFiltersButton = filterCols.length > 0 || enableStatusFilter;
    const filterPanel = (
        <div className="mt-3 space-y-4 rounded-xl border border-slate-200 p-4">
            {enableStatusFilter && (
                <div>
                    <span className="mb-1.5 block text-xs font-medium">
                        Status
                    </span>
                    <StatusFilter
                        value={statusScope}
                        onChange={handleStatusChange}
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
                                            handleColumnFilter(col.key, value)
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
                                            handleColumnFilter(
                                                col.key,
                                                (v as string) ?? '',
                                            );
                                            (col.filterResets ?? []).forEach(
                                                (k) =>
                                                    handleColumnFilter(k, ''),
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
                                        handleColumnFilter(
                                            col.key,
                                            e.target.value,
                                        )
                                    }
                                    placeholder={`Filter by ${col.label.toLowerCase()}…`}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                                />
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // ── List body ──────────────────────────────────────────────────────────────
    const tableMode = Boolean(listHeader);
    const skeletonNodes = Array.from({ length: 7 }).map((_, i) =>
        tableMode ? (
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
                tableMode
                    ? 'px-6 py-12 text-center'
                    : 'rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center'
            }
        >
            <p className="text-sm">No records found.</p>
            {hasActiveFilters && (
                <button
                    onClick={clearAllFilters}
                    className="mt-2 text-sm font-medium underline-offset-2 hover:underline"
                >
                    Clear filters
                </button>
            )}
        </div>
    );

    const rowNodes = rows.map((row, i) => (
        <React.Fragment key={String(getRowId(row as T) || i)}>
            {renderCard
                ? renderCard(row, {
                      onRestore: () => runRestore(row),
                      onArchive: () => runArchive(row),
                      onDelete: async () => {
                          if (inUseCheck) {
                              const entries = await inUseCheck(row, 'delete');
                              if (entries.some((e) => e.count > 0)) {
                                  setInUseEntries(entries);
                                  setInUseTarget(row);
                                  return;
                              }
                          }
                          setDeleteTarget(row);
                      },
                      onEdit: () => openEditModal(row),
                      restoring,
                      archiving,
                      canEdit,
                      canArchive,
                      canDelete,
                  } satisfies CardActions)
                : defaultCard(row)}
        </React.Fragment>
    ));

    const listShell = (children: React.ReactNode) =>
        tableMode ? (
            <div className="overflow-hidden rounded-2xl border border-[#ecedf1] bg-white shadow-sm">
                {listHeader}
                <div className="divide-y divide-gray-100">{children}</div>
            </div>
        ) : (
            <div className="space-y-3">{children}</div>
        );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="2xl:min-w-7x mx-auto mt-2 w-full">
                {statusFilterOptions && statusFilterOptions.length > 0 && (
                    <div className="mb-4">
                        <StatusFilter
                            value={customStatusScope}
                            onChange={handleStatusChange}
                            tabs={statusFilterOptions}
                        />
                    </div>
                )}

                <Toolbar
                    columns={columns}
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    searchableCols={searchableCols}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSortByChange={handleSortByChange}
                    onSortDirToggle={() =>
                        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                    }
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                    filtersOpen={filtersOpen}
                    onFiltersToggle={() => setFiltersOpen((o) => !o)}
                    hasActiveColumnFilters={hasActiveColumnFilters}
                    showFiltersButton={showFiltersButton}
                    filterPanel={filterPanel}
                />

                {hasActiveFilters && (
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs">Filters applied</span>
                        <button
                            onClick={clearAllFilters}
                            className="text-xs font-medium underline-offset-2 hover:underline"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {isError && (
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 px-4 py-3 text-sm text-rose-700">
                        <span>⚠ {error?.message}</span>
                        <button
                            onClick={() => refetch()}
                            className="font-medium underline-offset-2 hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="relative">
                    {isLoading && rows.length === 0
                        ? listShell(skeletonNodes)
                        : rows.length === 0
                          ? tableMode
                              ? listShell(emptyState)
                              : emptyState
                          : listShell(rowNodes)}

                    {isFetching && !isLoading && <FetchingSpinner />}
                </div>
                {/* PAGINATION */}
                {meta && (
                    <PaginationBar
                        meta={meta}
                        page={page}
                        loading={isFetching}
                        onPageChange={setPage}
                    />
                )}
                {/* IF RECORD IS ALREADY USED */}
                <ConfirmInUseModal
                    open={inUseTarget !== null}
                    recordLabel={
                        inUseTarget
                            ? formatCell(inUseTarget[columns[0]?.key])
                            : undefined
                    }
                    usages={inUseEntries}
                    onClose={() => {
                        setInUseTarget(null);
                        setInUseEntries([]);
                    }}
                />
                {/* IF RECORD CAN BE DELETED */}
                <ConfirmDeleteModal
                    open={deleteTarget !== null}
                    busy={deleting}
                    label={
                        deleteTarget
                            ? formatCell(deleteTarget[columns[0]?.key])
                            : undefined
                    }
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={confirmDelete}
                />
            </div>
        </>
    );
}

export default DataTableCardField;
