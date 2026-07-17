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
import React, { act, useCallback, useEffect, useMemo, useState } from 'react';
import type { InUseEntry } from '@/components/modal/ConfirmInUseModal';
import { ConfirmInUseModal } from '@/components/modal/ConfirmInUseModal';
import { useAsyncAction } from '@/hooks/use-async-action';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { useCrud } from '@/hooks/use-crud';
import { usePermission } from '@/hooks/use-permissions';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/apiFetch';
import { parseApiError } from '@/lib/parseApiError';
import { cn } from '@/lib/utils';
import type { CardActions } from '@/types/reusable/card';
import type { DataTableProps } from '@/types/reusable/data-table';
import type { FileFieldValue, ModalMode } from '@/types/reusable/fields';
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

/**
 * Deep-scans a save payload for an actual File/Blob so the progress bar only
 * appears for real uploads (a file field left empty falls back to the JSON
 * path, which never reports progress).
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
    updateMethod = 'POST',
    enableCreate,
    createLabel,
    enableEdit,
    restoreUrl,
    archiveUrl,
    deleteUrl,
    deleteConfirmText,
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
    listHeader,
    defaultSortBy,
    defaultSortDir,
    createPermission,
    editPermission,
    archivePermission,
    deletePermission,
    localModalState,
    setLocalModalState,
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
        () =>
            queryClient.invalidateQueries({
                queryKey: [queryKey],
            }),
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
    // Real upload progress (0–100) for create/update requests carrying files;
    // null while idle so the modal only shows the bar during an actual upload.
    // Declared before useCrud so it can be handed in as the progress callback.
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
            filters: {
                ...debouncedFilters,
                ...(extraFilters ?? {}),
            },
        },
        createUrl: createUrl ?? apiUrl,
        updateUrl: ({ id }) => {
            if (updateUrl) {
                return updateUrl(modalState?.row as T);
            }
            return `${apiUrl}/${id}`;
        },
        deleteUrl: deleteUrl
            ? (id) =>
                  deleteUrl({
                      id,
                  } as unknown as T)
            : undefined,
        archiveUrl: archiveUrl
            ? (id) =>
                  archiveUrl({
                      id,
                  } as unknown as T)
            : undefined,
        restoreUrl: restoreUrl
            ? (id) =>
                  restoreUrl({
                      id,
                  } as unknown as T)
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
        setModalState({
            mode: 'create',
        });
        setModalError(null);
        setUploadProgress(null);
    };
    const openEditModal = (row: T) => {
        setModalState({
            mode: 'edit',
            row,
        });
        setModalError(null);
        setUploadProgress(null);
    };
    const closeModal = () => {
        setModalState(null);
        setModalError(null);
        setUploadProgress(null);
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
        setColumnFilters((prev) => ({
            ...prev,
            [col]: value,
        }));
    };

    // Status filter. The "no constraint" tab (Active/Inactive/All's 'all', or the
    // empty-string tab of a custom option set) clears the `status` key entirely,
    // so nothing is sent to the API and the list shows every status.
    const statusScope: string = columnFilters.status ?? 'all';
    const customStatusScope: string = columnFilters.status ?? '';
    const handleStatusChange = (scope: string) => {
        setColumnFilters((prev) => {
            const next = {
                ...prev,
            };
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
            // payload = formValues;
            // Extract raw value fields from your custom file uploader state
            payload = {
                ...formValues,
            };

            // Check if our custom image structure exists in the form sub-state
            if (payload.image && typeof payload.image === 'object') {
                const imgObj = payload.image as Record<string, unknown>;
                if (Array.isArray(imgObj.files) && imgObj.files.length > 0) {
                    // // Extract the raw file reference and map it to your Laravel image key
                    // payload.image = imgObj.files[0];
                    // Pass the entire array of files to the backend
                    payload.images = imgObj.files;
                }

                // Strip the nested state object out so it doesn't pollute the payload validation
                delete payload.image;
            }
        } else {
            payload = {};
            const visibleFields = resolvedFields.filter((f) =>
                isFieldVisible(f, mode, row),
            );
            visibleFields.forEach((f) => {
                const raw = formValues[f.key];
                // Read from `key`, but submit under `payloadKey` when the
                // API expects a different name than the display/read key.
                const outKey = f.payloadKey ?? f.key;
                payload[outKey] = f.transform ? f.transform(raw) : raw;
            });

            // File fields: when the existing file was removed and no
            // replacement was picked, the payload carries no File, so the
            // request goes out as JSON. Emit the generic `remove_<key>` flag the
            // backend understands (HandlesFileUploads::fileWasRemoved) and clear
            // the wrapper so the column is nulled server-side.
            visibleFields
                .filter((f) => f.type === 'file')
                .forEach((f) => {
                    const outKey = f.payloadKey ?? f.key;
                    const val = payload[outKey] as FileFieldValue | undefined;
                    const removed =
                        !!val &&
                        val.removedIds?.length > 0 &&
                        val.files?.length === 0;
                    if (removed) {
                        payload[`remove_${outKey}`] = true;
                        payload[outKey] = null;
                    }
                });
        }

        // Surface the progress bar immediately when the payload carries a file;
        // JSON-only saves leave it null so no idle bar appears.
        const uploading = containsFile(payload);
        if (uploading) {
            setUploadProgress(0);
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
        } finally {
            // Clear the bar whether the upload succeeded or failed.
            if (uploading) {
                setUploadProgress(null);
            }
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
            toast({
                title: 'Restored',
                variant: 'info',
            });
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
            toast({
                title: 'Archived',
                variant: 'info',
            });
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
                {
                    method: 'DELETE',
                },
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
            toast({
                title: 'Deleted',
                variant: 'info',
            });
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
                {
                    method: 'PATCH',
                },
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
            toast({
                title: 'Suspended',
                variant: 'info',
            });
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
            <div
                className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md"
                data-cy="data-table-field-div-1"
            >
                <div
                    className="min-w-0 flex-1"
                    data-cy="data-table-field-div-2"
                >
                    <h3
                        className="truncate text-base font-semibold"
                        data-cy="data-table-field-h3-3"
                    >
                        {formatCell(row[titleCol?.key])}
                    </h3>
                    <dl
                        className="mt-1 space-y-0.5"
                        data-cy="data-table-field-dl-4"
                    >
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
                                <dd
                                    key={col.key}
                                    className="truncate text-sm"
                                    data-cy="data-table-field-dd-5"
                                >
                                    {value}
                                </dd>
                            );
                        })}
                    </dl>
                </div>
                <div
                    className="flex shrink-0 items-center gap-3 pt-0.5"
                    data-cy="data-table-field-div-6"
                >
                    {(row as Record<string, unknown>).status === 'active' ? (
                        <>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => openEditModal(row)}
                                    title="Edit"
                                    className="rounded-md p-1.5 transition-colors hover:bg-slate-100 hover:dark:bg-slate-100/30"
                                    data-cy="data-table-field-button-edit"
                                >
                                    <Pencil
                                        className="size-4.5"
                                        strokeWidth={1.75}
                                        data-cy="data-table-field-pencil-8"
                                    />
                                </button>
                            )}
                            {isSuspend ? (
                                <button
                                    type="button"
                                    onClick={() => setSuspendTarget(row)}
                                    title="Archive"
                                    className="rounded-md p-1.5 transition-colors hover:bg-slate-100 hover:dark:bg-slate-100/30"
                                    data-cy="data-table-field-button-archive"
                                >
                                    <UserRoundX
                                        className="size-4.5"
                                        strokeWidth={1.75}
                                        data-cy="data-table-field-user-round-x-10"
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
                                            data-cy="data-table-field-button-archive-2"
                                        >
                                            {archiving ? (
                                                <Loader2
                                                    className="size-4.5 animate-spin"
                                                    data-cy="data-table-field-loader2-12"
                                                />
                                            ) : (
                                                <Archive
                                                    className="size-4.5"
                                                    strokeWidth={1.75}
                                                    data-cy="data-table-field-archive-13"
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
                                data-cy="data-table-field-button-restore"
                            >
                                {restoring ? (
                                    <Loader2
                                        className="size-4.5 animate-spin"
                                        data-cy="data-table-field-loader2-15"
                                    />
                                ) : (
                                    <ArchiveRestore
                                        className="size-4.5"
                                        strokeWidth={1.75}
                                        data-cy="data-table-field-archive-restore-16"
                                    />
                                )}
                            </button>
                            {canDelete && (
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(row)}
                                    title="Delete"
                                    className="rounded-md p-1.5 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                    data-cy="data-table-field-button-delete"
                                >
                                    <Trash2
                                        className="size-4.5"
                                        strokeWidth={1.75}
                                        data-cy="data-table-field-trash2-18"
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
        <div
            className="mt-3 space-y-4 rounded-xl border border-slate-200 p-4"
            data-cy="data-table-field-div-19"
        >
            {/* Active / Inactive / All status filter (opt-in per list) */}
            {enableStatusFilter && (
                <div data-cy="data-table-field-div-20">
                    <span
                        className="mb-1.5 block text-xs font-medium"
                        data-cy="data-table-field-span-status"
                    >
                        Status
                    </span>
                    <StatusFilter
                        value={statusScope}
                        onChange={handleStatusChange}
                        data-cy="data-table-field-status-filter-status-change"
                    />
                </div>
            )}
            {filterCols.length > 0 && (
                <div
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
                    data-cy="data-table-field-div-23"
                >
                    {filterCols.map((col, i) => {
                        if (col.type == 'select' && col.typeData) {
                            return (
                                <div
                                    className="relative block"
                                    key={i}
                                    data-cy="data-table-field-div-24"
                                >
                                    <label
                                        htmlFor={col.label}
                                        className="mb-1 block text-xs font-medium"
                                        data-cy="data-table-field-label-col-label"
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
                                        data-cy="data-table-field-dropdown-column-filter"
                                    />
                                </div>
                            );
                        }

                        // Async-select column filter (id-based lookup). Prepend
                        // an "All" reset option; selecting it clears the filter
                        // (the backend ignores empty values).
                        if (col.type === 'async-select' && col.loadOptions) {
                            const loadWithAll = async (q: string) => [
                                {
                                    value: '',
                                    label: 'All',
                                },
                                ...(await col.loadOptions!(q)),
                            ];
                            return (
                                <label
                                    key={col.key}
                                    className="block"
                                    data-cy="data-table-field-label-27"
                                >
                                    <span
                                        className="mb-1 block text-xs font-medium"
                                        data-cy="data-table-field-span-28"
                                    >
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
                                        data-cy="data-table-field-async-select-field-all"
                                    />
                                </label>
                            );
                        }
                        return (
                            <label
                                key={col.key}
                                className="block"
                                data-cy="data-table-field-label-30"
                            >
                                <span
                                    className="mb-1 block text-xs font-medium"
                                    data-cy="data-table-field-span-31"
                                >
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
                                    data-cy="data-table-field-input-text"
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
    const skeletonNodes = Array.from({
        length: 7,
    }).map((_, i) =>
        tableMode ? (
            <div
                key={i}
                className="h-16 animate-pulse bg-gray-400/50"
                data-cy="data-table-field-div-33"
            />
        ) : (
            <div
                key={i}
                className="h-22 animate-pulse rounded-2xl border border-slate-200 bg-gray-300/40 dark:bg-gray-300/80"
                data-cy="data-table-field-div-34"
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
            data-cy="data-table-field-div-35"
        >
            <p
                className="text-sm"
                data-cy="data-table-field-p-no-records-found"
            >
                No records found.
            </p>
            {hasActiveFilters && (
                <button
                    onClick={clearAllFilters}
                    className="mt-2 text-sm font-medium underline-offset-2 hover:underline"
                    data-cy="data-table-field-button-clear-all-filters"
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
            <div
                className="overflow-hidden rounded-2xl border border-[#ecedf1] bg-white shadow-sm"
                data-cy="data-table-field-div-39"
            >
                {listHeader}
                <div
                    className="divide-y divide-gray-100"
                    data-cy="data-table-field-div-40"
                >
                    {children}
                </div>
            </div>
        ) : (
            <div className="space-y-3" data-cy="data-table-field-div-41">
                {children}
            </div>
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
                            'ml-2! inline-flex shrink-0 gap-1.5 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-400/90 [@media(min-width:300px)]:float-right',
                            actionsCreateClassName,
                        )}
                        data-cy="data-table-field-button-button"
                    >
                        <Plus
                            className="h-4 w-4"
                            strokeWidth={2}
                            data-cy="data-table-field-plus-43"
                        />
                        {createLabel ?? 'New'}
                    </button>
                ))}
            <div
                className="2xl:min-w-7x mx-auto mt-2 w-full"
                data-cy="data-table-field-div-44"
            >
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
                    <div className="mb-4" data-cy="data-table-field-div-45">
                        <StatusFilter
                            value={customStatusScope}
                            onChange={handleStatusChange}
                            tabs={statusFilterOptions}
                            data-cy="data-table-field-status-filter-status-change-2"
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
                    data-cy="data-table-field-toolbar-47"
                />

                {/* Active-filter indicator */}
                {hasActiveFilters && (
                    <div
                        className="mb-4 flex items-center justify-between"
                        data-cy="data-table-field-div-48"
                    >
                        <span
                            className="text-xs"
                            data-cy="data-table-field-span-filters-applied"
                        >
                            Filters applied
                        </span>
                        <button
                            onClick={clearAllFilters}
                            className="text-xs font-medium underline-offset-2 hover:underline"
                            data-cy="data-table-field-button-clear-all-filters-2"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* API error banner */}
                {isError && (
                    <div
                        className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 px-4 py-3 text-sm text-rose-700"
                        data-cy="data-table-field-div-51"
                    >
                        <span data-cy="data-table-field-span-52">
                            ⚠ {error?.message}
                        </span>
                        <button
                            onClick={() => refetch()}
                            className="font-medium underline-offset-2 hover:underline"
                            data-cy="data-table-field-button-refetch"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Record list — rounded table shell or a stack of cards */}
                <div className="relative" data-cy="data-table-field-div-54">
                    {isLoading && rows.length === 0
                        ? listShell(skeletonNodes)
                        : rows.length === 0
                          ? tableMode
                              ? listShell(emptyState)
                              : emptyState
                          : listShell(rowNodes)}

                    {/* Subtle loading overlay on subsequent fetches (page change, sort, etc.) */}
                    {isFetching && !isLoading && (
                        <FetchingSpinner data-cy="data-table-field-fetching-spinner-55" />
                    )}
                </div>

                {/* Pagination bar */}
                {meta && (
                    <PaginationBar
                        meta={meta}
                        page={page}
                        loading={isFetching}
                        onPageChange={setPage}
                        data-cy="data-table-field-pagination-bar-56"
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
                            uploadProgress,
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
                            uploadProgress={uploadProgress}
                            onClose={closeModal}
                            onSubmit={handleSave}
                            onError={onSaveError}
                            data-cy="data-table-field-record-modal-close-modal"
                        />
                    ))}
                {localModalState &&
                    (renderModal ? (
                        renderModal({
                            mode: localModalState.mode,
                            row: localModalState.row,
                            title:
                                modalTitle?.(localModalState) ??
                                (localModalState.mode === 'create'
                                    ? `New ${title ?? 'record'}`
                                    : `Edit ${title ?? 'record'}`),
                            isLoading:
                                crud.create.isPending || crud.update.isPending,
                            error: modalError,
                            uploadProgress,
                            onClose: () => setLocalModalState(null),
                            onSubmit: handleSave,
                        })
                    ) : (
                        <RecordModal
                            mode={localModalState.mode}
                            row={localModalState.row}
                            fields={resolvedFields}
                            title={
                                modalTitle?.(localModalState) ??
                                (localModalState.mode === 'create'
                                    ? `New ${title ?? 'record'}`
                                    : `Edit ${title ?? 'record'}`)
                            }
                            uploadProgress={uploadProgress}
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
                    data-cy="data-table-field-confirm-in-use-modal-set-in-use-target"
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
                    confirmText={
                        deleteTarget
                            ? deleteConfirmText?.(deleteTarget)
                            : undefined
                    }
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={confirmDelete}
                    isSelfDelete={isSelfDelete}
                    data-cy="data-table-field-confirm-delete-modal-59"
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
                    data-cy="data-table-field-confirm-archive-account-modal-60"
                />
            </div>
        </>
    );
}
export default DataTableField;
