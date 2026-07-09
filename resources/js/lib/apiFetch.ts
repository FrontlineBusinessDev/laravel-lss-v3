/**
 * @file lib/apiFetch.ts
 * Thin fetch wrapper for the app's session-authenticated JSON API.
 *
 * Adds JSON + CSRF headers and same-origin credentials, and unwraps the shared
 * `{ success, message, data }` envelope returned by BaseController. Two entry
 * points:
 *   - apiFetch      → low-level, returns the raw Response (caller checks res.ok)
 *   - apiFetchJson  → parses JSON and throws ApiError on a non-2xx response
 */

import { getCsrfToken } from '@/components/table/utils';

export class ApiError extends Error {
    readonly status: number;
    readonly errors?: Record<string, string[]>;

    constructor(
        message: string,
        status: number,
        errors?: Record<string, string[]>,
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

interface ApiEnvelope<T> {
    success?: boolean;
    message?: string;
    data: T;
}

/** Reads a cookie value by name, URL-decoded. Returns null when absent. */
function readCookie(name: string): string | null {
    const match = document.cookie.match(
        new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'),
    );

    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Low-level fetch: injects Accept/CSRF headers + credentials, returns the raw
 * Response so callers can branch on `res.ok` (used by delete/suspend flows).
 */
export function apiFetch(
    url: string,
    init: RequestInit = {},
): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');

    // Only set Content-Type to JSON if the body isn't a FormData object
    if (
        init.body &&
        !headers.has('Content-Type') &&
        !(init.body instanceof FormData)
    ) {
        headers.set('Content-Type', 'application/json');
    }

    // Prefer the encrypted XSRF-TOKEN cookie (Laravel decrypts the
    // X-XSRF-TOKEN header); fall back to the <meta name="csrf-token"> value.
    const xsrf = readCookie('XSRF-TOKEN');

    if (xsrf) {
        headers.set('X-XSRF-TOKEN', xsrf);
    } else {
        const csrf = getCsrfToken();

        if (csrf) {
            headers.set('X-CSRF-TOKEN', csrf);
        }
    }

    return fetch(url, { credentials: 'same-origin', ...init, headers });
}

/**
 * Fetch + parse JSON, throwing ApiError on a non-2xx response. Returns the
 * parsed envelope; callers read `.data` for the payload. A 204 (delete) yields
 * `{ data: null }` so callers don't choke on an empty body.
 */
export async function apiFetchJson<T>(
    url: string,
    init: RequestInit = {},
): Promise<ApiEnvelope<T>> {
    const res = await apiFetch(url, init);

    if (res.status === 204) return { data: null as T };

    const body = (await res.json().catch(() => null)) as
        | (ApiEnvelope<T> & { errors?: Record<string, string[]> })
        | null;

    if (!res.ok) {
        const message =
            (body && typeof body.message === 'string' && body.message) ||
            `Request failed with status ${res.status}`;
        throw new ApiError(message, res.status, body?.errors);
    }

    return (body ?? { data: null as T }) as ApiEnvelope<T>;
}
