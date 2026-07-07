/**
 * @file types/reusable/pagination.ts
 * Shared pagination + CRUD query contracts for the DataTableField / useCrud stack.
 * Mirrors the JSON envelope produced by App\Http\Controllers\BaseController.
 */

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
    links?: { prev: string | null; next: string | null };
    filterable?: string[];
    searchable?: string[];
    filters?: Record<string, string>;
    search?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
}

/** Legacy alias kept for the table hooks that consumed the older name. */
export type TableApiResponse<T> = PaginatedResponse<T>;

/** Query-string parameters accepted by the pagination-search endpoint. */
export interface CrudQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
    [key: string]: unknown;
}
