/**
 * @file components/table/hooks/use-card-table-controller.ts
 * All non-presentational logic for <DataTableCardField>: view/query/filter
 * state, server- or client-side pagination, and the archive/restore/delete
 * row actions. Keeps the component itself pure presentation. Behavior is a
 * 1:1 relocation of the logic that previously lived inline.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCrud } from '@/hooks/use-crud';
import { usePermission } from '@/hooks/use-permissions';
import { useToast } from '@/hooks/use-toast';
import type {
    DataTableProps,
    PaginationMeta,
    TableViewType,
} from '@/types/reusable/data-table';
import { deriveFieldsFromColumns } from '../utils';
import { useRecordRowActions } from './use-record-row-actions';
import { useDebouncedValue, useTableRefresh } from './index';

/** Upper bound fetched in client-pagination mode before local slicing. */
const CLIENT_FETCH_SIZE = 100;

function normalizeQueryKey(apiQueryKey: string | string[]): string[] {
    return Array.isArray(apiQueryKey)
        ? apiQueryKey.map(String)
        : [String(apiQueryKey)];
}

/** Synthesizes pagination meta for a locally-sliced (client-mode) list. */
function clientMeta(
    total: number,
    page: number,
    perPage: number,
): PaginationMeta {
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const from = total === 0 ? null : (page - 1) * perPage + 1;
    const to = total === 0 ? null : Math.min(page * perPage, total);

    return {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total,
        from,
        to,
    };
}

export function useCardTableController<T extends Record<string, unknown>>(
    props: DataTableProps<T>,
) {
    const {
        apiUrl,
        apiQueryKey,
        columns,
        fields,
        updateUrl,
        updateMethod = 'PUT',
        enableEdit,
        restoreUrl,
        archiveUrl,
        deleteUrl,
        onRestore,
        onArchive,
        onDelete,
        onRefreshRef,
        inUseCheck,
        extraFilters,
        defaultSortBy,
        defaultSortDir,
        editPermission,
        archivePermission,
        deletePermission,
        viewType = 'table',
        paginationMode = 'server',
    } = props;

    const { can } = usePermission();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const clientMode = paginationMode === 'client';

    const queryKey = useMemo(
        () => normalizeQueryKey(apiQueryKey),
        [apiQueryKey],
    );
    const invalidateTable = useCallback(
        () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
        [queryClient, queryKey],
    );

    // ── View / query / filter state ───────────────────────────────────────────
    const [view, setView] = useState<TableViewType>(viewType);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
        {},
    );
    const [sortBy, setSortBy] = useState<string>(
        defaultSortBy ?? columns[0]?.key ?? 'id',
    );
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(
        defaultSortDir ?? 'asc',
    );
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [modalState, setModalState] = useState<{
        mode: 'edit';
        row?: T;
    } | null>(null);

    const debouncedSearch = useDebouncedValue(searchInput, 350);
    const debouncedFilters = useDebouncedValue(columnFilters, 350);
    const extraFiltersKey = JSON.stringify(extraFilters ?? {});

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
            page: clientMode ? 1 : page,
            per_page: clientMode ? CLIENT_FETCH_SIZE : perPage,
            search: debouncedSearch || undefined,
            sort_by: sortBy,
            sort_dir: sortDir,
            filters: { ...debouncedFilters, ...(extraFilters ?? {}) },
        },
        updateUrl: ({ id }) =>
            updateUrl ? updateUrl(modalState?.row as T) : `${apiUrl}/${id}`,
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

    const allRows = crud.data;
    const displayRows = clientMode
        ? allRows.slice((page - 1) * perPage, page * perPage)
        : allRows;
    const meta = clientMode
        ? clientMeta(allRows.length, page, perPage)
        : crud.pageInfo;

    useTableRefresh(crud.list.refetch, onRefreshRef);

    // ── Permissions ───────────────────────────────────────────────────────────
    const resolvedFields = useMemo(
        () => fields ?? deriveFieldsFromColumns(columns),
        [fields, columns],
    );
    const canEdit =
        (enableEdit ?? resolvedFields.length > 0) &&
        (editPermission ? can(editPermission) : true);
    const canArchive = archivePermission ? can(archivePermission) : true;
    const canDelete = deletePermission ? can(deletePermission) : true;

    // ── Filter handlers ───────────────────────────────────────────────────────
    const handleColumnFilter = (col: string, value: string) =>
        setColumnFilters((prev) => ({ ...prev, [col]: value }));
    const handleStatusChange = (scope: string) =>
        setColumnFilters((prev) => {
            const next = { ...prev };

            if (scope === 'all' || scope === '') {
delete next.status;
} else {
next.status = scope;
}

            return next;
        });
    const handleSortBy = (col: string) => {
        setSortDir((d) => (sortBy === col && d === 'asc' ? 'desc' : 'asc'));
        setSortBy(col);
        setPage(1);
    };
    const clearAllFilters = () => {
        setSearchInput('');
        setColumnFilters({});
        setPage(1);
    };

    // ── Row actions (archive / restore / delete + in-use guard) ────────────────
    const actions = useRecordRowActions<T>({
        apiUrl,
        restoreUrl,
        archiveUrl,
        deleteUrl,
        onRestore,
        onArchive,
        onDelete,
        inUseCheck,
        mutations: {
            restore: (id) => crud.restore.mutateAsync(id),
            archive: (id) => crud.archive.mutateAsync(id),
        },
        invalidateTable,
        toast,
    });

    return {
        // view
        view,
        setView,
        // query/filter state
        page,
        setPage,
        perPage,
        setPerPage,
        searchInput,
        setSearchInput,
        columnFilters,
        sortBy,
        sortDir,
        filtersOpen,
        setFiltersOpen,
        statusScope: columnFilters.status ?? 'all',
        customStatusScope: columnFilters.status ?? '',
        hasActiveFilters:
            Boolean(searchInput) || Object.values(columnFilters).some(Boolean),
        hasActiveColumnFilters: Object.values(columnFilters).some(Boolean),
        handleColumnFilter,
        handleStatusChange,
        handleSortBy,
        setSortDir,
        clearAllFilters,
        // data
        displayRows,
        meta,
        isLoading: crud.isLoading,
        isFetching: crud.isFetching,
        isError: crud.list.isError,
        error: crud.list.error as Error | null,
        refetch: crud.list.refetch,
        // permissions
        canEdit,
        canArchive,
        canDelete,
        // edit modal
        openEditModal: (row: T) => setModalState({ mode: 'edit', row }),
        // row actions (archive / restore / delete + in-use guard)
        ...actions,
    };
}
