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

/**
 * Standard fetch init plus an optional upload-progress callback. When present
 * (and the body is FormData) the request is sent via XMLHttpRequest so real
 * `xhr.upload` progress events can be reported — native fetch cannot do this.
 */
export type ApiFetchInit = RequestInit & {
    onUploadProgress?: (percent: number) => void;
};

/** Reads a cookie value by name, URL-decoded. Returns null when absent. */
function readCookie(name: string): string | null {
    const match = document.cookie.match(
        new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'),
    );

    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Sends a request via XMLHttpRequest so `xhr.upload.onprogress` can drive a
 * progress bar, then resolves a synthesized `Response` so downstream helpers
 * (apiFetchJson) consume it exactly like a fetch() result.
 */
function xhrUpload(
    url: string,
    init: ApiFetchInit,
    headers: Headers,
    onUploadProgress: (percent: number) => void,
): Promise<Response> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(init.method ?? 'POST', url, true);
        // Mirror fetch's `credentials: 'same-origin'` default so the session
        // cookie rides along; only 'omit' should suppress credentials.
        xhr.withCredentials = (init.credentials ?? 'same-origin') !== 'omit';

        // Content-Type is intentionally absent for FormData — the browser sets
        // the multipart boundary itself, both here and in the fetch path.
        headers.forEach((value, key) => xhr.setRequestHeader(key, value));

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                onUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            // Guarantee the bar reaches 100% once the body is fully sent.
            onUploadProgress(100);

            // 204/205 must not carry a body per the Response contract.
            const noBody = xhr.status === 204 || xhr.status === 205;
            const responseHeaders = new Headers();
            const contentType = xhr.getResponseHeader('Content-Type');

            if (contentType) {
                responseHeaders.set('Content-Type', contentType);
            }

            resolve(
                new Response(noBody ? null : xhr.responseText, {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: responseHeaders,
                }),
            );
        };

        xhr.onerror = () => reject(new TypeError('Network request failed'));
        xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'));

        xhr.send(init.body as FormData);
    });
}

/**
 * Low-level fetch: injects Accept/CSRF headers + credentials, returns the raw
 * Response so callers can branch on `res.ok` (used by delete/suspend flows).
 */
export function apiFetch(
    url: string,
    init: ApiFetchInit = {},
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

    // Progress-aware uploads must use XHR — fetch() has no upload-progress API.
    // Only FormData bodies qualify; JSON payloads have no meaningful upload
    // phase and keep using fetch unchanged.
    if (init.onUploadProgress && init.body instanceof FormData) {
        return xhrUpload(url, init, headers, init.onUploadProgress);
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
    init: ApiFetchInit = {},
): Promise<ApiEnvelope<T>> {
    const res = await apiFetch(url, init);

    if (res.status === 204) {
return { data: null as T };
}

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
