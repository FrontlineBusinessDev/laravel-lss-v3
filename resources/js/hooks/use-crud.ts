/**
 * @file hooks/useCrud.ts
 * Generic TanStack Query hook for CRUD operations against any endpoint that
 * follows the app's `Route::crudModule()` shape (see routes/web.php):
 *
 *   GET    {baseUrl}/pagination-search
 *   POST   {baseUrl}
 *   PUT    {baseUrl}/{id}
 *   PATCH  {baseUrl}/{id}/archive
 *   PATCH  {baseUrl}/{id}/restore
 *   DELETE {baseUrl}/{id}
 *
 * Provides mutations for Create, Update, Delete, Archive, and Restore, with
 * automatic cache invalidation on success and a single place to hook every
 * mutation failure into the app's Toast notifications.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiFetchJson, ApiError } from '@/lib/apiFetch';
import type {
    CrudQueryParams,
    PaginatedResponse,
} from '@/types/reusable/pagination';

export interface UseCrudOptions {
    /** Resource route prefix, e.g. '/clients'. */
    baseUrl: string;
    baseUrlPaginationSearch?: string;
    baseUrlSearchActive?: string;
    /** Optional explicit list URL override. */
    listUrl?: string;
    /** Optional create URL override. */
    createUrl?:
        | string
        | ((payload: Partial<Record<string, unknown>>) => string);
    /** Optional update URL override. */
    updateUrl?:
        | string
        | ((ctx: {
              id: string | number;
              data: Partial<Record<string, unknown>>;
          }) => string);
    /** Optional delete URL override. */
    deleteUrl?: string | ((id: string | number) => string);
    /** Optional archive URL override. */
    archiveUrl?: string | ((id: string | number) => string);
    /** Optional restore URL override. */
    restoreUrl?: string | ((id: string | number) => string);
    /** HTTP method for create requests. */
    createMethod?: 'POST' | 'PUT' | 'PATCH';
    /** HTTP method for update requests. */
    updateMethod?: 'PUT' | 'PATCH';
    /** TanStack Query cache key, e.g. 'clients'. Defaults to 'crud'. */
    queryKey?: string[] | string;
    queryParams?: CrudQueryParams;
    /** Called with a human-readable message whenever any mutation fails. */
    onError?: (message: string) => void;
}

export interface UseCrudResult<T> {
    // Query
    list: UseQueryResult<PaginatedResponse<T>, Error>;
    isLoading: boolean;
    isFetching: boolean;
    data: T[];
    pageInfo: PaginatedResponse<T>['meta'];

    // Mutations
    create: UseMutationResult<T, Error, Partial<T>>;
    update: UseMutationResult<
        T,
        Error,
        { id: string | number; data: Partial<T> }
    >;
    delete: UseMutationResult<void, Error, string | number>;
    archive: UseMutationResult<T, Error, string | number>;
    restore: UseMutationResult<T, Error, string | number>;
}

function errorMessage(error: unknown): string {
    if (error instanceof ApiError || error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
}

/**
 * Generic CRUD hook for managing API resources with TanStack Query.
 *
 * @example
 *   const crud = useCrud<Client>({
 *     baseUrl: '/clients',
 *     baseUrlPaginationSearch: '/clients',
 *     baseUrlSearchActive: '/clients',
 *     queryKey: 'clients',
 *     queryParams: { page: 1, per_page: 10 },
 *     onError: (message) => showToast(`Error: ${message}`),
 *   });
 *
 *   await crud.create.mutateAsync({ company_name: 'Acme' });
 *   await crud.update.mutateAsync({ id: 1, data: { company_name: 'Acme Corp' } });
 *   await crud.archive.mutateAsync(1);
 *   await crud.restore.mutateAsync(1);
 *   await crud.delete.mutateAsync(1);
 */
export function useCrud<T extends { id?: number | string }>(
    options: UseCrudOptions,
): UseCrudResult<T> {
    const {
        baseUrl,
        baseUrlPaginationSearch = '',
        baseUrlSearchActive = '',
        listUrl: explicitListUrl,
        createUrl,
        updateUrl,
        deleteUrl,
        archiveUrl,
        restoreUrl,
        createMethod = 'POST',
        updateMethod = 'PUT',
        queryKey = 'crud',
        queryParams = {},
        onError,
    } = options;
    const queryClient = useQueryClient();

    const handleError = (error: unknown) => {
        onError?.(errorMessage(error));
    };

    // Mirrors the list query's key shape (`[queryKey, queryParams]`, see
    // below) so this actually matches it. `[queryKey]` is a valid prefix of
    // that key regardless of whether queryKey is a string or an array, so
    // TanStack's partial matching invalidates every cached page/sort/filter
    // variant of this resource — not just the one currently on screen.
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
    };

    // Build query string. Plain-object values (e.g. `filters`) are expanded
    // into bracketed pairs — `filters[status]=active` — which is the shape
    // Laravel's `$request->input('filters')` parses back into an array.
    // `String(value)` on the object would otherwise emit `[object Object]`
    // and the backend would receive no usable filters.
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (
            typeof value === 'object' &&
            !Array.isArray(value) &&
            Object.getPrototypeOf(value) === Object.prototype
        ) {
            Object.entries(value as Record<string, unknown>).forEach(
                ([nestedKey, nestedValue]) => {
                    if (
                        nestedValue === undefined ||
                        nestedValue === null ||
                        nestedValue === ''
                    ) {
                        return;
                    }

                    // Array filter values (e.g. multi-select client/assignee
                    // ids) are emitted as repeated `key[nestedKey][]=v` pairs so
                    // Laravel parses them back into an array for `whereIn`. A
                    // plain String([...]) would collapse them into one CSV
                    // scalar that the backend can't use.
                    if (Array.isArray(nestedValue)) {
                        nestedValue.forEach((item) => {
                            if (
                                item !== undefined &&
                                item !== null &&
                                item !== ''
                            ) {
                                searchParams.append(
                                    `${key}[${nestedKey}][]`,
                                    String(item),
                                );
                            }
                        });

                        return;
                    }

                    searchParams.append(
                        `${key}[${nestedKey}]`,
                        String(nestedValue),
                    );
                },
            );

            return;
        }

        searchParams.append(key, String(value));
    });
    const queryString = searchParams.toString();

    const listUrl =
        explicitListUrl ??
        `${baseUrl}${baseUrlPaginationSearch || baseUrlSearchActive}${queryString ? `?${queryString}` : ''}`;

    // Query: Fetch list
    const list = useQuery<PaginatedResponse<T>, Error>({
        queryKey: [queryKey, queryParams],
        queryFn: async () => {
            const response = await apiFetchJson<PaginatedResponse<T>>(listUrl);

            return response.data as PaginatedResponse<T>;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Mutation: Create
    const create = useMutation<T, Error, Partial<T>>({
        mutationFn: async (payload) => {
            const resolvedUrl =
                typeof createUrl === 'function'
                    ? createUrl(payload)
                    : (createUrl ?? baseUrl);
            const response = await apiFetchJson<T>(resolvedUrl, {
                method: createMethod,
                body: JSON.stringify(payload),
            });

            return response.data as T;
        },
        onSuccess: invalidate,
        onError: handleError,
    });

    // Mutation: Update — the crudModule route macro only registers PUT.
    const update = useMutation<
        T,
        Error,
        { id: string | number; data: Partial<T> }
    >({
        mutationFn: async ({ id, data }) => {
            const context = { id, data };
            const resolvedUrl =
                typeof updateUrl === 'function'
                    ? updateUrl(context)
                    : (updateUrl ?? `${baseUrl}/${id}`);
            const response = await apiFetchJson<T>(resolvedUrl, {
                method: updateMethod,
                body: JSON.stringify(data),
            });

            return response.data as T;
        },
        onSuccess: invalidate,
        onError: handleError,
    });

    // Mutation: Delete (hard delete)
    const deleteMutation = useMutation<void, Error, string | number>({
        mutationFn: async (id) => {
            const resolvedUrl =
                typeof deleteUrl === 'function'
                    ? deleteUrl(id)
                    : (deleteUrl ?? `${baseUrl}/${id}`);
            await apiFetchJson(resolvedUrl, { method: 'DELETE' });
        },
        onSuccess: invalidate,
        onError: handleError,
    });

    // Mutation: Archive (soft delete via status)
    const archive = useMutation<T, Error, string | number>({
        mutationFn: async (id) => {
            const resolvedUrl =
                typeof archiveUrl === 'function'
                    ? archiveUrl(id)
                    : (archiveUrl ?? `${baseUrl}/${id}/archive`);
            const response = await apiFetchJson<T>(resolvedUrl, {
                method: 'PATCH',
            });

            return response.data as T;
        },
        onSuccess: invalidate,
        onError: handleError,
    });

    // Mutation: Restore
    const restore = useMutation<T, Error, string | number>({
        mutationFn: async (id) => {
            const resolvedUrl =
                typeof restoreUrl === 'function'
                    ? restoreUrl(id)
                    : (restoreUrl ?? `${baseUrl}/${id}/restore`);
            const response = await apiFetchJson<T>(resolvedUrl, {
                method: 'PATCH',
            });

            return response.data as T;
        },
        onSuccess: invalidate,
        onError: handleError,
    });

    return {
        list,
        isLoading: list.isLoading,
        isFetching: list.isFetching,
        data: list.data?.data ?? [],
        pageInfo: list.data?.meta ?? {
            current_page: 0,
            last_page: 0,
            per_page: 10,
            total: 0,
            from: null,
            to: null,
        },
        create,
        update,
        delete: deleteMutation,
        archive,
        restore,
    };
}
