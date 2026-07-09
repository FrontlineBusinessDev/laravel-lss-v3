/**
 * @file DataTableField.tsx
 * Root orchestrator — wires hooks, state, and sub-components together.
 *
 * This file intentionally contains NO business logic of its own.
 * Every concern is delegated:
 *
 *   Data fetching  →  hooks/index.ts  (useTableQuery, useInvalidateTable)
 *   URL building   →  utils/index.ts  (buildRestoreUrl, buildArchiveUrl …)
 *   Formatting     →  utils/index.ts  (formatCell, deriveFieldsFromColumns …)
 *   Pagination UI  →  components/Pagination.tsx
 *   Toolbar UI     →  components/Toolbar.tsx
 *   Create/edit    →  components/RecordModal.tsx
 *   Delete confirm →  components/ConfirmDeleteModal.tsx
 *   Types          →  types/index.ts
 *
 * ─── Quick-start ──────────────────────────────────────────────────────────────
 *
 *   <DataTableField
 *     apiUrl="/settings/users"
 *     columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }]}
 *     title="Users"
 *   />
 *
 * See types/index.ts → DataTableProps for the full prop surface.
 */

import type { InUseEntry } from '@/components/modal/ConfirmInUseModal';
import { ConfirmInUseModal } from '@/components/modal/ConfirmInUseModal';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useCrud } from '@/hooks/use-crud';
import { usePermission } from '@/hooks/use-permissions';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/apiFetch';
import { parseApiError } from '@/lib/parseApiError';
import { cn } from '@/lib/utils';
import type { CardActions } from '@/types/reusable/card';
import type { DataTableProps } from '@/types/reusable/data-table';
import type { ModalMode } from '@/types/reusable/fields';
import { usePage } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Archive,
    ArchiveRestore,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    UserRoundX,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown } from '../Dropdown';
import { ConfirmArchiveAccountModal } from '../modal/ConfirmArchiveAccountModal';
import { ConfirmDeleteModal } from '../modal/ConfirmDeleteModal';
import FetchingSpinner from '../spinners/FetchingSpinner';
import { PaginationBar } from './components/Pagination';
import { RecordModal } from './components/RecordModal';
import { StatusFilter } from './components/StatusFilter';
import { Toolbar } from './components/Toolbar';
import { useDebouncedValue, useTableRefresh } from './hooks';
import {
    buildArchiveUrl,
    buildDeleteUrl,
    buildRestoreUrl,
    buildSuspendUrl,
    deriveFieldsFromColumns,
    formatCell,
    getRowId,
    isFieldVisible,
} from './utils';

/**
 * Normalizes the caller-supplied `apiQueryKey` into a stable string array.
 *
 * A bare string MUST be wrapped in an array (`['/x']`), never spread
 * (`[...'/x']`) — spreading explodes the string into individual characters
 * (`['/', 'x']`), producing a key that never matches the list query and
 * silently breaks every cache invalidation that rebuilds it.
 */
function normalizeQueryKey(apiQueryKey: string | string[]): string[] {
    return Array.isArray(apiQueryKey)
        ? apiQueryKey.map(String)
        : [String(apiQueryKey)];
}

export function DataTableField<T extends Record<string, unknown>>({
    apiUrl,
    apiQueryKey,
    columns,
    fields,
    title,
    description,
    actions,
    actionsCreateClassName = '',
    renderCard,
    renderModal,
    createUrl,
    updateUrl,
    updateMethod = 'PUT',
    enableCreate,
    createLabel,
    enableEdit,
    restoreUrl,
    archiveUrl,
    deleteUrl,
    modalTitle,
    onRestore,
    onArchive,
    onSuspend,
    onDelete,
    onCreated,
    onUpdated,
    onSaveError,
    onRefreshRef,
    inUseCheck,
    enableSuspend = false,
    enableStatusFilter = false,
    statusFilterOptions,
    extraFilters,
    filterControls,
    listHeader,
    defaultSortBy,
    defaultSortDir,
    createPermission,
    editPermission,
    archivePermission,
    deletePermission,
}: DataTableProps<T>) {
    const { can } = usePermission();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Single, stable cache key for this resource. `useCrud` keys the list query
    // as `[queryKey, queryParams]`, so every mutation refresh below reuses this
    // exact value — one source of truth, no ad-hoc rebuilding.
    const queryKey = useMemo(
        () => normalizeQueryKey(apiQueryKey),
        [apiQueryKey],
    );

    // Invalidate every cached page/sort/filter variant of the list so it
    // refetches after a mutation. The key is wrapped one level deeper
    // (`[queryKey]`) to mirror `useCrud`'s list key `[queryKey, queryParams]` —
    // a partial-match prefix that catches the on-screen query and all cached
    // siblings. Used by every archive/restore/delete/suspend handler below.
    const invalidateTable = useCallback(
        () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
        [queryClient, queryKey],
    );

    // The logged-in user's id — used to detect self-delete on the users table
    const currentUserId = usePage().props.auth.user.id;
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

    // Debounce free-text inputs so the query only fires after the user pauses
    const debouncedSearch = useDebouncedValue(searchInput, 350);
    const debouncedFilters = useDebouncedValue(columnFilters, 350);

    // Parent-owned extra filters (e.g. multi-select client/assignee ids) come in
    // un-debounced; a stable string key lets us reset paging when they change
    // without depending on the object identity.
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
            // Merge parent-supplied extra filters (multi-select ids, etc.) on
            // top of the toolbar's own column filters. The list query hashes by
            // content, so the fresh object here doesn't cause spurious refetches.
            filters: { ...debouncedFilters, ...(extraFilters ?? {}) },
        },
        createUrl: createUrl ?? apiUrl,
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
    const canCreate =
        (enableCreate ?? resolvedFields.length > 0) &&
        (createPermission ? can(createPermission) : true);

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
    const openCreateModal = () => {
        setModalState({ mode: 'create' });
        setModalError(null);
    };
    const openEditModal = (row: T) => {
        setModalState({ mode: 'edit', row });
        setModalError(null);
    };
    const closeModal = () => {
        setModalState(null);
        setModalError(null);
    };

    // ── Delete confirmation state ─────────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const isSelfDelete =
        apiUrl === '/settings/users' &&
        deleteTarget !== null &&
        String(getRowId(deleteTarget)) === String(currentUserId);

    // ── Suspend confirmation state ─────────────────────────────────────────────
    const [suspendTarget, setSuspendTarget] = useState<T | null>(null);
    const [suspend, setSuspend] = useState(false);
    const isSuspend = enableSuspend;
    const isSelfSuspend =
        apiUrl === '/settings/users' &&
        suspendTarget !== null &&
        String(getRowId(suspendTarget)) === String(currentUserId);
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

    // Status filter. The "no constraint" tab (Active/Inactive/All's 'all', or the
    // empty-string tab of a custom option set) clears the `status` key entirely,
    // so nothing is sent to the API and the list shows every status.
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

    // ── Save (create or update) ───────────────────────────────────────────────
    const handleSave = async (values: unknown) => {
        if (!modalState) {
            return;
        }

        const { mode, row } = modalState;

        const formValues = values as Record<string, unknown>;

        // A custom renderModal fully owns its own field set and value
        // shaping — trust it as-is. Only the default RecordModal path
        // (driven by the `fields` prop) needs the transform/whitelist step
        // below, since that's the contract RecordModal is built against.
        // Filtering a custom modal's submission through `fields` would
        // silently drop any field `fields` doesn't happen to declare.
        let payload: Record<string, unknown>;

        if (renderModal) {
            payload = formValues;
        } else {
            payload = {};
            resolvedFields
                .filter((f) => isFieldVisible(f, mode, row))
                .forEach((f) => {
                    const raw = formValues[f.key];
                    // Read from `key`, but submit under `payloadKey` when the
                    // API expects a different name than the display/read key.
                    const outKey = f.payloadKey ?? f.key;
                    payload[outKey] = f.transform ? f.transform(raw) : raw;
                });
        }

        try {
            setModalError(null);
            const saved =
                mode === 'create'
                    ? await crud.create.mutateAsync(payload as Partial<T>)
                    : await crud.update.mutateAsync({
                          id: String(getRowId(row as T)),
                          data: payload as Partial<T>,
                      });

            toast({
                title: `${title ?? 'Record'} ${mode === 'create' ? 'created' : 'updated'}`,
                variant: 'success',
            });

            if (mode === 'create') {
                onCreated?.(saved);
            } else {
                onUpdated?.(saved);
            }

            closeModal();
        } catch (err) {
            const error =
                err instanceof Error
                    ? err
                    : new Error('Failed to save record.');
            setModalError(error.message);
            toast({
                title: mode === 'create' ? 'Create failed' : 'Update failed',
                description: error.message,
                variant: 'error',
            });
            onSaveError?.(error);

            throw error;
        }
    };

    // ── Archive / Restore / Delete ────────────────────────────────────────────
    const handleRestore = async (row: T) => {
        try {
            if (onRestore) {
                await onRestore(row, buildRestoreUrl(row, apiUrl, restoreUrl));
            } else {
                await crud.restore.mutateAsync(String(getRowId(row)));
            }

            // Refresh the list regardless of path: the `onRestore` escape hatch
            // does a raw fetch that never touches the react-query cache, so the
            // built-in `crud.restore` invalidation wouldn't have run.
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

            // Covers both paths: the `onArchive` raw-fetch escape hatch (which
            // bypasses the cache) and the `crud.archive` mutation.
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
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);

        try {
            const res = await apiFetch(
                buildDeleteUrl(deleteTarget, apiUrl, deleteUrl),
                { method: 'DELETE' },
            );

            if (!res.ok) {
                const apiError = await parseApiError(res);

                // Backend in-use block (safety net if frontend check was bypassed)
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

            // The DELETE already happened above — this is a lifecycle
            // notification only. Do NOT also call crud.delete.mutateAsync
            // here: the row is already gone, so a second delete attempt at
            // the same id 404s and would report a false "Delete failed"
            // even though the record was removed successfully.
            await onDelete?.(
                deleteTarget,
                buildDeleteUrl(deleteTarget, apiUrl, deleteUrl),
            );
            invalidateTable();
            toast({ title: 'Deleted', variant: 'info' });

            if (isSelfDelete) {
                window.location.href = '/login';
            }

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

    const confirmSuspend = async () => {
        if (!suspendTarget) {
            return;
        }

        setSuspend(true);

        try {
            const res = await apiFetch(
                buildSuspendUrl(suspendTarget, apiUrl, archiveUrl),
                { method: 'PATCH' },
            );

            if (!res.ok) {
                const apiError = await parseApiError(res);

                // Backend in-use block (safety net if frontend check was bypassed)
                if (apiError.inUse && apiError.inUse.some((e) => e.count > 0)) {
                    setInUseEntries(apiError.inUse);
                    setInUseTarget(deleteTarget);
                    setDeleteTarget(null);

                    return;
                }

                toast({
                    title: 'Suspend failed',
                    description: apiError.message,
                    variant: 'error',
                });

                return;
            }

            // Notify the parent that the suspend happened (lifecycle hook).
            await onSuspend?.(
                suspendTarget,
                buildSuspendUrl(suspendTarget, apiUrl, archiveUrl),
            );
            // Refresh the list so the suspended row leaves the active view.
            invalidateTable();
            toast({ title: 'Suspended', variant: 'info' });

            if (isSelfSuspend) {
                window.location.href = '/login';
            } // force logout

            setSuspendTarget(null);
        } catch (err) {
            const error =
                err instanceof Error ? err : new Error('Failed to Suspend.');
            toast({
                title: 'Suspend failed',
                description: error.message,
                variant: 'error',
            });
        } finally {
            setSuspend(false);
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
                            {isSuspend ? (
                                <button
                                    type="button"
                                    onClick={() => setSuspendTarget(row)}
                                    title="Archive"
                                    className="rounded-md p-1.5 transition-colors hover:bg-slate-100 hover:dark:bg-slate-100/30"
                                >
                                    <UserRoundX
                                        className="size-4.5"
                                        strokeWidth={1.75}
                                    />
                                </button>
                            ) : (
                                <>
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

    // ── Filter panel (passed as a slot to <Toolbar>) ───────────────────────────
    const filterCols = columns.filter(
        (c) => c.filterable || filterableCols.includes(c.key),
    );
    // The panel (and its toggle button) is worth showing if there are column
    // text filters OR the opt-in status filter now lives inside it.
    const showFiltersButton = filterCols.length > 0 || enableStatusFilter;
    const filterPanel = (
        <div className="mt-3 space-y-4 rounded-xl border border-slate-200 p-4">
            {/* Active / Inactive / All status filter (opt-in per list) */}
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
                                        options={col.typeData.map(
                                            (item) =>
                                                (item as { value: string })
                                                    .value,
                                        )}
                                        value={columnFilters[col.key] ?? 'All'}
                                        onChange={(value) =>
                                            handleColumnFilter(col.key, value)
                                        }
                                    />
                                </div>
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

    // ── List body (shared across card + table presentations) ───────────────────
    // When `listHeader` is supplied the rows render as a single rounded table
    // shell (header row + rules); otherwise they stack as standalone cards.
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
                          // CHECK IF RECORD IS ASSOCIATED
                          if (inUseCheck) {
                              const entries = await inUseCheck(row, 'delete');

                              if (entries.some((e) => e.count > 0)) {
                                  setInUseEntries(entries);
                                  setInUseTarget(row);

                                  return; // blocked — show in-use modal
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

    // Wraps the rows in the rounded table shell (header + divided rows) or a
    // plain stack, matching the active presentation.
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
            {actions ??
                (canCreate && (
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className={cn(
                            'float-right inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-400/90',
                            actionsCreateClassName,
                        )}
                    >
                        <Plus className="h-4 w-4" strokeWidth={2} />
                        {createLabel ?? 'New'}
                    </button>
                ))}
            <div className="2xl:min-w-7x mx-auto mt-2 w-full">
                {/* Page header */}
                {/* {(title || description || canCreate) && (
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div className="inline-block">
                            {title && (
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="mt-1 text-sm">{description}</p>
                            )}
                        </div>
                    </div>
                )} */}
                {/* Always-visible status tab bar (opt-in via statusFilterOptions).
                Used by the ticket history page for lifecycle stages; the generic
                Active/Inactive/All control still lives inside the filter panel. */}
                {statusFilterOptions && statusFilterOptions.length > 0 && (
                    <div className="mb-4">
                        <StatusFilter
                            value={customStatusScope}
                            onChange={handleStatusChange}
                            tabs={statusFilterOptions}
                        />
                    </div>
                )}

                {/* Search / sort / filter toolbar (status filter now lives inside
                the collapsible filter panel) */}
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

                {/* Parent-owned filter controls (e.g. Ticket History's multi-select
                client / assignee dropdowns). Presentational slot only. */}
                {filterControls && (
                    <div className="mb-4 flex flex-wrap items-center gap-2.5">
                        {filterControls}
                    </div>
                )}

                {/* Active-filter indicator */}
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

                {/* API error banner */}
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

                {/* Record list — rounded table shell or a stack of cards */}
                <div className="relative">
                    {isLoading && rows.length === 0
                        ? listShell(skeletonNodes)
                        : rows.length === 0
                          ? tableMode
                              ? listShell(emptyState)
                              : emptyState
                          : listShell(rowNodes)}

                    {/* Subtle loading overlay on subsequent fetches (page change, sort, etc.) */}
                    {isFetching && !isLoading && <FetchingSpinner />}
                </div>

                {/* Pagination bar */}
                {meta && (
                    <PaginationBar
                        meta={meta}
                        page={page}
                        loading={isFetching}
                        onPageChange={setPage}
                    />
                )}

                {/* Create / edit modal */}
                {modalState &&
                    (renderModal ? (
                        renderModal({
                            mode: modalState.mode,
                            row: modalState.row,
                            title:
                                modalTitle?.(modalState) ??
                                (modalState.mode === 'create'
                                    ? `New ${title ?? 'record'}`
                                    : `Edit ${title ?? 'record'}`),
                            isLoading:
                                crud.create.isPending || crud.update.isPending,
                            error: modalError,
                            onClose: closeModal,
                            onSubmit: handleSave,
                        })
                    ) : (
                        <RecordModal
                            mode={modalState.mode}
                            row={modalState.row}
                            fields={resolvedFields}
                            title={
                                modalTitle?.(modalState) ??
                                (modalState.mode === 'create'
                                    ? `New ${title ?? 'record'}`
                                    : `Edit ${title ?? 'record'}`)
                            }
                            onClose={closeModal}
                            onSubmit={handleSave}
                            onError={onSaveError}
                        />
                    ))}

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
                {/* Delete confirmation */}
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
                    isSelfDelete={isSelfDelete}
                />
                {/* Suspend confirmation */}
                <ConfirmArchiveAccountModal
                    open={suspendTarget !== null}
                    busy={suspend}
                    label={
                        suspendTarget
                            ? formatCell(suspendTarget[columns[0]?.key])
                            : undefined
                    }
                    onCancel={() => setSuspendTarget(null)}
                    onConfirm={confirmSuspend}
                    isSelfSuspend={isSelfSuspend}
                />
            </div>
        </>
    );
}

export default DataTableField;
