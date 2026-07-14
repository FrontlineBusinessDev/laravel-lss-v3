/**
 * @file api-service-layer/http.ts
 * Typed CRUD helper factory bound to a resource `baseUrl`. One place that
 * mirrors the `Route::crudModule` surface (index / pagination-search /
 * search-active / lookup / {id}/in-use / store / update / archive / restore /
 * destroy), so each concrete service is a thin, strongly-typed binding.
 *
 * File-bearing payloads are auto-serialized to FormData (with Laravel's PUT
 * spoofing) and real upload progress is forwarded to Axios.
 */

import type { AxiosResponse } from 'axios';
import type {
    CrudQueryParams,
    PaginatedResponse,
} from '@/types/reusable/pagination';
import { http, unwrap } from './client';
import { buildFormData, buildQueryString, hasBinaryFiles } from './form-data';

/** A single `{ value, label }` option as returned by lookup endpoints. */
export interface LookupOption {
    value: string | number;
    label: string;
}

/** Progress-aware request options carried through create/update. */
export interface WriteOptions {
    onUploadProgress?: (percent: number) => void;
}

export interface CrudResourceOptions {
    /** Resource route prefix, e.g. '/settings/partner-schools'. */
    baseUrl: string;
    /** HTTP verb for update; PUT is spoofed to POST when sending files. */
    updateMethod?: 'PUT' | 'PATCH';
}

/** Serializes params into a `?query` suffix, or '' when there are none. */
function query(params?: Record<string, unknown>): string {
    if (!params) {
        return '';
    }

    const qs = buildQueryString(params);

    return qs ? `?${qs}` : '';
}

/** Forwards a progress callback to Axios's native onUploadProgress. */
function progressConfig(opts?: WriteOptions) {
    if (!opts?.onUploadProgress) {
        return {};
    }

    const cb = opts.onUploadProgress;

    return {
        onUploadProgress: (e: { loaded: number; total?: number }) => {
            if (e.total) {
                cb(Math.round((e.loaded / e.total) * 100));
            }
        },
    };
}

/**
 * Builds the standard CRUD method set for a resource. Concrete services spread
 * this and add their own module-specific endpoints.
 */
export function createCrudResource<T, TInput = Partial<T>>(
    options: CrudResourceOptions,
) {
    const { baseUrl, updateMethod = 'PUT' } = options;

    const write = (
        url: string,
        method: 'POST',
        payload: unknown,
        opts?: WriteOptions,
        spoof?: 'PUT' | 'PATCH',
    ): Promise<AxiosResponse> => {
        const useForm = hasBinaryFiles(payload);

        if (!useForm) {
            return http.request({ url, method, data: payload });
        }

        const body = buildFormData(payload as Record<string, unknown>);

        // Laravel can't read multipart bodies on PUT/PATCH — spoof via POST.
        if (spoof) {
            body.append('_method', spoof);
        }

        return http.request({
            url,
            method,
            data: body,
            ...progressConfig(opts),
        });
    };

    return {
        baseUrl,

        /** GET / — the plain index payload (non-paginated). */
        getAll: async (params?: CrudQueryParams): Promise<T[]> =>
            unwrap<T[]>(await http.get(`${baseUrl}${query(params)}`)),

        /** GET /pagination-search — paginated + filtered + searched list. */
        getPaginatedFilterSearch: async (
            params?: CrudQueryParams,
        ): Promise<PaginatedResponse<T>> =>
            unwrap<PaginatedResponse<T>>(
                await http.get(`${baseUrl}/pagination-search${query(params)}`),
            ),

        /** GET /search-active — active-only records for pickers. */
        searchActive: async (params?: CrudQueryParams): Promise<T[]> =>
            unwrap<T[]>(
                await http.get(`${baseUrl}/search-active${query(params)}`),
            ),

        /** GET /lookup — `{ value, label }` options (defaults to active). */
        lookup: async (
            q = '',
            params?: Record<string, unknown>,
        ): Promise<LookupOption[]> =>
            unwrap<LookupOption[]>(
                await http.get(
                    `${baseUrl}/lookup${query({ status: 'active', q, ...params })}`,
                ),
            ),

        /** GET /{id}/in-use — relationship guard before delete. */
        inUse: async (id: string | number): Promise<T> =>
            unwrap<T>(await http.get(`${baseUrl}/${id}/in-use`)),

        /** POST / — create a record. */
        create: async (data: TInput, opts?: WriteOptions): Promise<T> =>
            unwrap<T>(await write(baseUrl, 'POST', data, opts)),

        /** PUT /{id} (POST-spoofed for files) — update a record. */
        update: async (
            id: string | number,
            data: TInput,
            opts?: WriteOptions,
        ): Promise<T> =>
            unwrap<T>(
                await write(
                    `${baseUrl}/${id}`,
                    'POST',
                    data,
                    opts,
                    updateMethod,
                ),
            ),

        /** PATCH /{id}/archive — soft-delete (suspend). */
        archive: async (id: string | number): Promise<T> =>
            unwrap<T>(await http.patch(`${baseUrl}/${id}/archive`)),

        /** PATCH /{id}/restore — reactivate an archived record. */
        restore: async (id: string | number): Promise<T> =>
            unwrap<T>(await http.patch(`${baseUrl}/${id}/restore`)),

        /** DELETE /{id} — hard delete. */
        delete: async (id: string | number): Promise<T> =>
            unwrap<T>(await http.delete(`${baseUrl}/${id}`)),
    };
}

/** The shape returned by `createCrudResource`, for typing service objects. */
export type CrudResource<T, TInput = Partial<T>> = ReturnType<
    typeof createCrudResource<T, TInput>
>;
