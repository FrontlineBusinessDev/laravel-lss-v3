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
    updateMethod?: 'POST' | 'PUT' | 'PATCH';
    /** TanStack Query cache key, e.g. 'clients'. Defaults to 'crud'. */
    queryKey?: string[] | string;
    queryParams?: CrudQueryParams;
    /** Called with a human-readable message whenever any mutation fails. */
    onError?: (message: string) => void;
    /**
     * Upload progress (0–100) for create/update mutations that carry files.
     * Only fires on the multipart/FormData path; JSON payloads never call it.
     */
    onUploadProgress?: (percent: number) => void;
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
 * Helper to check if a payload contains files/binary streams
 */
function hasBinaryFiles(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') {
return false;
}

    return Object.values(obj).some((val) => {
        if (val instanceof File || val instanceof Blob) {
return true;
}

        if (typeof val === 'object' && val !== null) {
            return hasBinaryFiles(val); // Recursively search deep structures
        }

        return false;
    });
}

/**
 * Recursively flattens nested objects/arrays into standard HTML FormData.
 * Safely handles text inputs, arrays, booleans, and intercepts your
 * specific 'image' file state structure to avoid 422 errors.
 */
function buildFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) {
return;
}

        // Single-file logo field. Append the file under the clean `image` key
        // so `$request->file('image')` resolves it server-side. A dotted
        // `image.files` field name is mangled by PHP into `image_files` and
        // never reaches the controller — which is why the URL came back null.
        if (
            key === 'image' &&
            value &&
            typeof value === 'object' &&
            'files' in value
        ) {
            const fileWrapper = value as { files?: unknown[] };
            const actualFile = fileWrapper.files?.[0];

            if (actualFile instanceof File || actualFile instanceof Blob) {
                formData.append('image', actualFile);
            }

            return;
        }

        // Handle standard array entries
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item instanceof File || item instanceof Blob) {
                    formData.append(`${key}[]`, item);
                } else if (item !== undefined && item !== null) {
                    formData.append(`${key}[]`, String(item));
                }
            });

            return;
        }

        // Handle standalone nested raw objects
        if (
            typeof value === 'object' &&
            !(value instanceof File) &&
            !(value instanceof Blob) &&
            !(value instanceof Date)
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

                    if (Array.isArray(nestedValue)) {
                        nestedValue.forEach((item) => {
                            if (
                                item !== undefined &&
                                item !== null &&
                                item !== ''
                            ) {
                                formData.append(
                                    `${key}[${nestedKey}][]`,
                                    String(item),
                                );
                            }
                        });

                        return;
                    }

                    formData.append(
                        `${key}[${nestedKey}]`,
                        String(nestedValue),
                    );
                },
            );

            return;
        }

        // Handle standalone raw files
        if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);

            return;
        }

        // Handle standard string / boolean / number primitives
        formData.append(key, String(value));
    });

    return formData;
}

/**
 * Recursively scans an object and converts any File/Blob instances
 * into a base64 Data URL string so it can be transmitted safely over JSON.
 */
async function transformFilesToBinary(obj: unknown): Promise<any> {
    if (!obj || typeof obj !== 'object') {
return obj;
}

    // Helper to read a single file into a base64 string
    const fileToBase64 = (file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    // If it's an array, map over its items recursively
    if (Array.isArray(obj)) {
        return Promise.all(obj.map((item) => transformFilesToBinary(item)));
    }

    // If it's a file wrapper object, convert it immediately
    if (obj instanceof File || obj instanceof Blob) {
        return await fileToBase64(obj);
    }

    // If it's a standard dictionary object, map over keys recursively
    const serialized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        serialized[key] = await transformFilesToBinary(value);
    }

    return serialized;
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
        onUploadProgress,
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

            const useForm = hasBinaryFiles(payload);
            const body = useForm
                ? buildFormData(payload as Record<string, unknown>)
                : JSON.stringify(payload);

            const response = await apiFetchJson<T>(resolvedUrl, {
                method: createMethod, // Keeps native 'POST'
                body,
                headers: {}, // Empty so apiFetch dynamically configures JSON vs Multi-part boundaries
                // Report real upload progress only when sending files.
                ...(useForm && onUploadProgress ? { onUploadProgress } : {}),
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

            const useForm = hasBinaryFiles(data);
            let finalMethod = updateMethod;
            let body: string | FormData;

            if (useForm) {
                body = buildFormData(data as Record<string, unknown>);
                // Laravel PUT Fix: Append spoof parameter & toggle network layer to POST
                body.append('_method', updateMethod);
                finalMethod = 'POST';
            } else {
                body = JSON.stringify(data);
            }

            const response = await apiFetchJson<T>(resolvedUrl, {
                method: finalMethod,
                body,
                // Leave headers empty; let custom apiFetch handle it
                headers: {},
                // Report real upload progress only when sending files.
                ...(useForm && onUploadProgress ? { onUploadProgress } : {}),
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
