/**
 * @file lib/apiFetch.ts
 * Backward-compatible adapter over the centralized Axios client
 * (`@/api-service-layer/client`). Preserves the exact `apiFetch` /
 * `apiFetchJson` / `ApiError` surface the app already depends on, so existing
 * callers (use-crud, the DataTable components, modal flows) keep working while
 * all transport, CSRF, and credentials handling now live in one Axios instance.
 *
 *   - apiFetch      → low-level, returns a synthesized Response (caller checks res.ok)
 *   - apiFetchJson  → parses JSON and throws ApiError on a non-2xx response
 */

import { http, ApiError } from '@/api-service-layer/client';
import type { ApiEnvelope } from '@/api-service-layer/client';

export { ApiError };

/**
 * Standard fetch init plus an optional upload-progress callback. When present
 * (and the body is FormData) real `xhr.upload` progress is reported via Axios.
 */
export type ApiFetchInit = RequestInit & {
    onUploadProgress?: (percent: number) => void;
};

/**
 * Low-level request: routes through the shared Axios instance (CSRF + Accept
 * headers injected by its interceptor) and synthesizes a `Response` so callers
 * can branch on `res.ok` exactly as with the previous fetch implementation.
 * `validateStatus` is disabled so non-2xx responses resolve here instead of
 * throwing — the raw callers own that branching.
 */
export async function apiFetch(
    url: string,
    init: ApiFetchInit = {},
): Promise<Response> {
    const headers = new Headers(init.headers);

    // JSON bodies need the Content-Type; FormData must omit it so the browser
    // sets the multipart boundary. Mirrors the original wrapper's logic.
    if (
        init.body &&
        !headers.has('Content-Type') &&
        !(init.body instanceof FormData)
    ) {
        headers.set('Content-Type', 'application/json');
    }

    const isFormData = init.body instanceof FormData;

    const response = await http.request({
        url,
        method: (init.method ?? 'GET').toUpperCase(),
        data: init.body ?? undefined,
        headers: Object.fromEntries(headers.entries()),
        responseType: 'text',
        validateStatus: () => true,
        withCredentials: (init.credentials ?? 'same-origin') !== 'omit',
        ...(init.onUploadProgress && isFormData
            ? {
                  onUploadProgress: (e: { loaded: number; total?: number }) => {
                      const total = e.total ?? 0;
                      const percent = total
                          ? Math.round((e.loaded / total) * 100)
                          : 100;
                      init.onUploadProgress?.(percent);
                  },
              }
            : {}),
    });

    // 204/205 must not carry a body per the Response contract.
    const noBody = response.status === 204 || response.status === 205;
    const responseHeaders = new Headers();
    const contentType = (
        response.headers as Record<string, string> | undefined
    )?.['content-type'];

    if (contentType) {
        responseHeaders.set('Content-Type', contentType);
    }

    return new Response(noBody ? null : (response.data as string), {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
    });
}

/**
 * Fetch + parse JSON, throwing ApiError on a non-2xx response. Returns the
 * parsed envelope; callers read `.data`. A 204 yields `{ data: null }`.
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
