/**
 * @file api-service-layer/client.ts
 * The single Axios instance every service (and the legacy apiFetch adapter)
 * routes through. Centralizes what the old lib/apiFetch.ts did inline:
 *   - same-origin session credentials
 *   - Accept / X-Requested-With headers
 *   - CSRF header injection (XSRF-TOKEN cookie, falling back to the meta tag)
 *   - normalizing every non-2xx response into a typed `ApiError`
 *
 * Success responses are returned untouched so callers can read the shared
 * `{ success, message, data }` envelope (see `unwrap`). Content-Type is left to
 * Axios: object bodies become JSON, FormData bodies get a multipart boundary.
 */

import axios from 'axios';
import type {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { getCsrfToken } from '@/components/table/utils';

/** Validation-aware error thrown for any non-2xx API response. */
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

/** The envelope BaseController wraps every JSON response in. */
export interface ApiEnvelope<T> {
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

/** Attaches CSRF + standard headers on every outgoing request. */
function attachHeaders(
    config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
    config.headers.set('Accept', 'application/json');
    config.headers.set('X-Requested-With', 'XMLHttpRequest');

    // Prefer the encrypted XSRF-TOKEN cookie (Laravel decrypts X-XSRF-TOKEN);
    // fall back to the <meta name="csrf-token"> value, mirroring apiFetch.
    const xsrf = readCookie('XSRF-TOKEN');

    if (xsrf) {
        config.headers.set('X-XSRF-TOKEN', xsrf);
    } else {
        const csrf = getCsrfToken();

        if (csrf) {
            config.headers.set('X-CSRF-TOKEN', csrf);
        }
    }

    return config;
}

/** Turns any Axios failure into the app's typed ApiError. */
function toApiError(error: AxiosError): Promise<never> {
    const response = error.response;
    const body = response?.data as
        | { message?: string; errors?: Record<string, string[]> }
        | undefined;

    const status = response?.status ?? 0;
    const message =
        (body && typeof body.message === 'string' && body.message) ||
        error.message ||
        `Request failed with status ${status}`;

    return Promise.reject(new ApiError(message, status, body?.errors));
}

/** Builds the shared instance; exported as a factory to keep it testable. */
export function createHttpClient(): AxiosInstance {
    const instance = axios.create({
        // Same-origin: keep relative paths (e.g. '/batches') working unchanged.
        baseURL: '',
        withCredentials: true,
    });

    instance.interceptors.request.use(attachHeaders);
    instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        toApiError,
    );

    return instance;
}

/** The app-wide Axios instance. Import this in every service module. */
export const http = createHttpClient();

/**
 * Unwraps the `{ success, message, data }` envelope, tolerating a 204/empty
 * body (returns null) so delete-style calls don't throw on an absent payload.
 */
export function unwrap<T>(response: AxiosResponse): T {
    if (response.status === 204 || response.data == null) {
        return null as T;
    }

    const body = response.data as ApiEnvelope<T>;

    // Some endpoints may return a bare payload rather than the envelope.
    return (body && 'data' in body ? body.data : (body as unknown as T)) as T;
}
