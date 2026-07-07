/**
 * @file utils/index.ts
 * Pure, side-effect-free helpers shared across the DataTableField system.
 * Nothing here imports React or touches the DOM — safe to unit-test in Node.
 */

import type { ColumnDef, FieldDef, FieldType, ModalMode } from '../types';

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Converts any cell value to a display string.
 * Returns an em-dash for empty / null / undefined values so cards
 * always render something legible.
 */
export function formatCell(value: unknown): string {
    if (value === null || value === undefined) {
        return '—';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return String(value);
}

// ─── Field helpers ────────────────────────────────────────────────────────────

/**
 * Derives a best-effort FieldDef list from columns when the consumer
 * doesn't supply an explicit `fields` prop.
 * Skips the `id` column (not user-editable) and defaults everything to text.
 */
export function deriveFieldsFromColumns<T>(
    columns: ColumnDef<T>[],
): FieldDef<T>[] {
    return columns
        .filter((c) => c.key !== 'id')
        .map((c) => ({
            key: c.key,
            label: c.label,
            type: 'text' as FieldType,
        }));
}

/**
 * Returns true when a field should be rendered in the given modal mode.
 * Defaults to visible in both modes unless explicitly opted out.
 */
export function isFieldVisible<T>(
    field: FieldDef<T>,
    mode: ModalMode,
    row?: T,
): boolean {
    if (mode === 'create') {
        return field.showOnCreate !== false;
    }

    // showOnEdit may be a predicate of the row being edited.
    return typeof field.showOnEdit === 'function'
        ? field.showOnEdit(row)
        : field.showOnEdit !== false;
}

/**
 * Resolves the disabled state for a field.
 * Supports both a static boolean and a dynamic callback `(mode, row) => boolean`.
 */
export function isFieldDisabled<T>(
    field: FieldDef<T>,
    mode: ModalMode,
    row?: T,
): boolean {
    if (typeof field.disabled === 'function') {
        return field.disabled(mode, row);
    }

    return Boolean(field.disabled);
}

// ─── URL builders ─────────────────────────────────────────────────────────────

/** Extracts the `id` field from a generic row record as a string. */
export function getRowId<T extends object>(row: T): string {
    return String((row as { id?: unknown }).id ?? '');
}

/**
 * Builds the restore URL for a row.
 * Falls back to `{apiUrl}/{id}/restore` when no custom builder is supplied.
 */
export function buildRestoreUrl<T extends object>(
    row: T,
    apiUrl: string,
    restoreUrl?: (row: T) => string,
): string {
    return restoreUrl ? restoreUrl(row) : `${apiUrl}/${getRowId(row)}/restore`;
}

/**
 * Builds the archive URL for a row.
 * Falls back to `{apiUrl}/{id}/archive`.
 */
export function buildArchiveUrl<T extends object>(
    row: T,
    apiUrl: string,
    archiveUrl?: (row: T) => string,
): string {
    return archiveUrl ? archiveUrl(row) : `${apiUrl}/${getRowId(row)}/archive`;
}

/**
 * Builds the suspend URL for a row.
 * Falls back to `{apiUrl}/{id}/suspend`.
 */
export function buildSuspendUrl<T extends object>(
    row: T,
    apiUrl: string,
    suspendUrl?: (row: T) => string,
): string {
    return suspendUrl ? suspendUrl(row) : `${apiUrl}/${getRowId(row)}/archive`;
}

/**
 * Builds the delete URL for a row.
 * Falls back to `{apiUrl}/{id}`.
 */
export function buildDeleteUrl<T extends object>(
    row: T,
    apiUrl: string,
    deleteUrl?: (row: T) => string,
): string {
    return deleteUrl ? deleteUrl(row) : `${apiUrl}/${getRowId(row)}`;
}

// ─── CSRF ─────────────────────────────────────────────────────────────────────

/**
 * Reads the CSRF token from the page's <meta name="csrf-token"> tag.
 * Returns an empty string when the tag is absent (e.g. in tests).
 */
export function getCsrfToken(): string {
    return (
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
            ?.content ?? ''
    );
}
