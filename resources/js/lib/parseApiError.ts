/**
 * @file lib/parseApiError.ts
 * Normalises a failed Response body into a predictable shape for the UI.
 * Surfaces the human message, field errors, and the `in_use` blocker list
 * that BaseController::destroy returns under `errors.in_use`.
 */

import type { InUseEntry } from '@/types/reusable/data-table';

export interface ParsedApiError {
    message: string;
    errors?: Record<string, string[]>;
    inUse?: InUseEntry[];
}

export async function parseApiError(res: Response): Promise<ParsedApiError> {
    const body = (await res.json().catch(() => null)) as {
        message?: string;
        errors?: Record<string, unknown>;
    } | null;

    const message =
        (body && typeof body.message === 'string' && body.message) ||
        `Request failed with status ${res.status}`;

    const errors =
        body && body.errors && typeof body.errors === 'object'
            ? (body.errors as Record<string, string[]>)
            : undefined;

    const rawInUse = errors ? (errors as Record<string, unknown>).in_use : null;
    const inUse = Array.isArray(rawInUse)
        ? (rawInUse as InUseEntry[])
        : undefined;

    return { message, errors, inUse };
}
