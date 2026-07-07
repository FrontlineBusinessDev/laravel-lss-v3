/**
 * @file hooks/index.ts
 * Custom React hooks for the DataTableField system.
 *
 * Split into two concerns:
 *  - useDebouncedValue  – generic debounce, no data-fetching knowledge
 *  - useTableQuery      – TanStack Query wrapper for the pagination-search API
 */

import {
    keepPreviousData,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { PaginationMeta, TableApiResponse } from '../types';

// ─── useDebouncedValue ────────────────────────────────────────────────────────

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of silence. Use this to avoid firing a query on every keypress.
 *
 * @example
 *   const debouncedSearch = useDebouncedValue(searchInput, 350);
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);

        return () => clearTimeout(id);
        // JSON.stringify so object/array values are compared by content
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(value), delay]);

    return debounced;
}

// ─── useTableQuery ────────────────────────────────────────────────────────────

/** Parameters that drive the pagination-search request. */
export interface TableQueryParams {
    apiUrl: string;
    page: number;
    perPage: number;
    search: string;
    sortBy: string;
    sortDir: 'asc' | 'desc';
    filters: Record<string, string>;
}

/**
 * Fetches a paginated, filtered, sorted page of records from the
 * Laravel BaseController `pagination-search` endpoint using TanStack Query.
 *
 * Features:
 *  - `keepPreviousData` so the list doesn't flash blank on page change
 *  - Stable query key so React Query deduplicates inflight requests
 *  - Returns `filterableCols` and `searchableCols` from the API response
 *    so the toolbar can self-configure without extra props
 *
 * @example
 *   const { data, isFetching, refetch } = useTableQuery({ apiUrl, page, ... });
 */
export function useTableQuery<T extends object>(params: TableQueryParams) {
    const { apiUrl, page, perPage, search, sortBy, sortDir, filters } = params;

    const queryKey = [
        'table',
        apiUrl,
        page,
        perPage,
        search,
        sortBy,
        sortDir,
        filters,
    ] as const;

    const query = useQuery<TableApiResponse<T>>({
        queryKey,
        queryFn: async ({ signal }) => {
            const qs = new URLSearchParams();
            qs.set('page', String(page));
            qs.set('per_page', String(perPage));
            qs.set('sort_by', sortBy);
            qs.set('sort_dir', sortDir);

            if (search) {
                qs.set('search', search);
            }

            Object.entries(filters).forEach(([col, val]) => {
                if (val) {
                    qs.set(`filters[${col}]`, val);
                }
            });

            const res = await fetch(
                `${apiUrl}/pagination-search?${qs.toString()}`,
                {
                    signal,
                    headers: { Accept: 'application/json' },
                },
            );

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            return res.json() as Promise<TableApiResponse<T>>;
        },
        placeholderData: keepPreviousData, // keeps previous page visible while loading next
        staleTime: 30_000, // treat data as fresh for 30 s
    });

    return {
        rows: query.data?.data ?? [],
        meta: (query.data?.meta ?? null) as PaginationMeta | null,
        filterableCols: query.data?.filterable ?? [],
        searchableCols: query.data?.searchable ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error as Error | null,
        refetch: query.refetch,
    };
}

// ─── useTableRefresh ──────────────────────────────────────────────────────────

/**
 * Wires up the `onRefreshRef` escape hatch so parent components can
 * imperatively trigger a refetch (e.g. after a custom modal save).
 *
 * @example
 *   const refreshRef = useRef<() => void>(() => {});
 *   useTableRefresh(refetch, onRefreshRef);
 *   // later: refreshRef.current()
 */
export function useTableRefresh(
    refetch: () => void,
    onRefreshRef?: (fn: () => void) => void,
) {
    useEffect(() => {
        onRefreshRef?.(refetch);
    }, [refetch, onRefreshRef]);
}

// ─── useInvalidateTable ───────────────────────────────────────────────────────

/**
 * Returns a function that invalidates all cached pages for a given `apiUrl`.
 * Use after mutations (create / update / archive / restore / delete) so
 * TanStack Query automatically refetches the current page.
 *
 * @example
 *   const invalidate = useInvalidateTable('/settings/users');
 *   await onDelete(row, url);
 *   invalidate();
 */
export function useInvalidateTable(apiUrl: string) {
    const client = useQueryClient();

    return () => client.invalidateQueries({ queryKey: ['table', apiUrl] });
}
