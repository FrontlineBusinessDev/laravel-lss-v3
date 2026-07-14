/**
 * @file components/form-modal/form-values.ts
 * Seeding + payload helpers for <FormModal>. Mirrors RecordModal's semantics so
 * the two share behavior: file fields carry a FileFieldValue, edit mode hydrates
 * from the row, and submit honors `payloadKey`/`transform`. Also maps a Laravel
 * validation-error bag onto Formik field errors.
 */

import { normalizeExistingFiles } from '@/hooks/use-file-upload-field';
import type { FieldDef, ModalMode } from '@/types/reusable/fields';

/** Initial value for a single field (edit hydrates from row, create uses default). */
function seedFieldValue<T extends object>(
    field: FieldDef<T>,
    mode: ModalMode,
    row?: T,
): unknown {
    if (field.type === 'file') {
        const raw =
            mode === 'edit' && row
                ? (row as Record<string, unknown>)[field.key]
                : null;

        return { existing: normalizeExistingFiles(raw), files: [], removedIds: [] };
    }

    if (mode === 'edit' && row) {
        let val = (row as Record<string, unknown>)[field.key];

        if (field.type === 'async-select' && Array.isArray(val)) {
            val = val[0] ?? '';
        }

        return val ?? '';
    }

    return field.defaultValue ?? (field.type === 'checkbox' ? false : '');
}

/** Builds the Formik initialValues object for the visible fields. */
export function buildInitialValues<T extends object>(
    fields: FieldDef<T>[],
    mode: ModalMode,
    row?: T,
): Record<string, unknown> {
    const init: Record<string, unknown> = {};
    fields.forEach((f) => {
        init[f.key] = seedFieldValue(f, mode, row);
    });

    return init;
}

/**
 * Shapes the outgoing payload: whitelists the visible fields and applies each
 * field's `payloadKey` (submit under a different name) and `transform`.
 */
export function buildPayload<T extends object>(
    fields: FieldDef<T>[],
    values: Record<string, unknown>,
): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
        const raw = values[f.key];
        payload[f.payloadKey ?? f.key] = f.transform ? f.transform(raw) : raw;
    });

    return payload;
}

/** Maps a Laravel `{ field: [msg, ...] }` bag to Formik `{ field: msg }`. */
export function mapApiErrorsToFormik(
    apiErrors: Record<string, string[]>,
): Record<string, string> {
    const mapped: Record<string, string> = {};
    Object.entries(apiErrors).forEach(([key, msgs]) => {
        mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
    });

    return mapped;
}
