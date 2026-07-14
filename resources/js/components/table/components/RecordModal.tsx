/**
 * @file components/table/components/RecordModal.tsx
 * Dynamic create / edit modal driven entirely by a `fields` array.
 *
 * Sits on the shared <Modal> primitive (portal, scrim, animation, Escape,
 * scroll-lock, header/close) so it matches CreateBatchModal exactly, while
 * staying generic: it renders whatever FieldDef[] it is handed via <DynamicField>
 * and honors the RenderModalProps contract, so every module reuses it unchanged.
 */

import { Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { normalizeExistingFiles } from '@/hooks/use-file-upload-field';
import type { FieldDef, ModalMode } from '../types';
import { isFieldDisabled, isFieldVisible } from '../utils';
import { DynamicField } from './RecordModalField';
interface RecordModalProps<T> {
    mode: ModalMode;
    row?: T;
    fields: FieldDef<T>[];
    title: string;
    /** Real upload progress (0–100) while a file is being sent, else null. */
    uploadProgress?: number | null;
    onClose: () => void;
    /** Called with the validated+transformed values. Should throw on API error. */
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    onError?: (error: Error) => void;
}
export function RecordModal<T extends object>({
    mode,
    row,
    fields,
    title,
    uploadProgress,
    onClose,
    onSubmit,
    onError,
}: RecordModalProps<T>) {
    // Only show fields relevant to the current mode (create vs edit)
    const visibleFields = useMemo(
        () => fields.filter((f) => isFieldVisible(f, mode, row)),
        [fields, mode, row],
    );

    // Seed form values: existing row data in edit mode, defaultValue in create.
    const initialValues = useMemo(
        () => buildInitialValues(visibleFields, mode, row),
        [visibleFields, mode, row],
    );
    const [values, setValues] =
        useState<Record<string, unknown>>(initialValues);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const setValue = (key: string, value: unknown) => {
        setValues((prev) => ({
            ...prev,
            [key]: value,
        }));
        setFieldErrors((prev) => ({
            ...prev,
            [key]: '',
        })); // clear per-field error
    };

    /** Runs required-check + custom validators. Returns false when any fail. */
    const validate = (): boolean => {
        const errs = collectErrors(visibleFields, values);
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!validate()) {
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit(values);
        } catch (err: unknown) {
            const error =
                err instanceof Error
                    ? err
                    : new Error('Failed to save record.');

            const setValue = (key: string, value: unknown) => {
                setValues((prev) => ({ ...prev, [key]: value }));
                setFieldErrors((prev) => ({ ...prev, [key]: '' })); // clear per-field error
            };

            /** Runs required-check + custom validators. Returns false when any fail. */
            const validate = (): boolean => {
                const errs = collectErrors(visibleFields, values);
                setFieldErrors(errs);

                return Object.keys(errs).length === 0;
            };

            const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setFormError(null);
                if (!validate()) return;
                setSubmitting(true);

                try {
                    await onSubmit(values);
                } catch (err: unknown) {
                    const error =
                        err instanceof Error
                            ? err
                            : new Error('Failed to save record.');

                    // Map Laravel validation errors ({ field: [msg, ...] }) back to fields
                    const apiErrors = (
                        error as Error & { errors?: Record<string, string[]> }
                    ).errors;

                    if (apiErrors) {
                        setFieldErrors((prev) => ({
                            ...prev,
                            ...mapApiErrors(apiErrors),
                        }));
                    }

                    setFormError(error.message);
                    onError?.(error);
                } finally {
                    setSubmitting(false);
                }
            };

            return (
                <Modal
                    open
                    onClose={onClose}
                    title={title}
                    maxWidth={520}
                    data-cy="record-modal-modal-title"
                >
                    {' '}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                        data-cy="record-modal-form-submit"
                    >
                        {' '}
                        <div
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                            data-cy="record-modal-div-3"
                        >
                            {visibleFields.map((f) => (
                                <div
                                    key={f.key}
                                    className={
                                        f.colSpan === 2 ? 'sm:col-span-2' : ''
                                    }
                                    data-cy="record-modal-div-4"
                                >
                                    <DynamicField
                                        field={f}
                                        value={values[f.key]}
                                        error={fieldErrors[f.key]}
                                        disabled={
                                            submitting ||
                                            isFieldDisabled(f, mode, row)
                                        }
                                        initialLabel={
                                            mode === 'edit' && row
                                                ? f.initialLabel?.(row)
                                                : undefined
                                        }
                                        onChange={(v) => setValue(f.key, v)}
                                        data-cy="record-modal-dynamic-field-set-value"
                                    />
                                </div>
                            ))}
                        </div>
                        {/* General form error (non-field API errors) */}
                        {formError && (
                            <p
                                className="rounded-md bg-danger-50 px-3 py-2 text-xs text-danger-600"
                                data-cy="record-modal-p-6"
                            >
                                {formError}
                            </p>
                        )}
                        {/* Live upload progress (only while a file is uploading) */}
                        {uploadProgress != null && (
                            <UploadProgress
                                value={uploadProgress}
                                data-cy="record-modal-upload-progress-7"
                            />
                        )}
                        {/* Footer actions */}
                        <div
                            className="flex items-center justify-end gap-2 pt-2"
                            data-cy="record-modal-div-8"
                        >
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                                data-cy="record-modal-button-button"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
                                data-cy="record-modal-button-submit"
                            >
                                {submitting && (
                                    <Loader2
                                        className="h-4 w-4 animate-spin"
                                        data-cy="record-modal-loader2-11"
                                    />
                                )}
                                {mode === 'create' ? 'Create' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                </Modal>
            );
        }
    };
}
/** Live upload progress bar (generic file uploads; CreateBatchModal lacks this). */
function UploadProgress({ value }: { value: number }) {
    return (
        <div data-cy="record-modal-div-12">
            <div
                className="mb-1 flex items-center justify-between text-xs font-medium text-neutral-500"
                data-cy="record-modal-div-13"
            >
                <span data-cy="record-modal-span-14">
                    {value >= 100 ? 'Processing…' : 'Uploading…'}
                </span>
                <span data-cy="record-modal-span-15">{value}%</span>
            </div>
            <div
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
                data-cy="record-modal-div-16"
            >
                <div
                    className="h-full rounded-full bg-brand-500 transition-[width] duration-200 ease-out"
                    style={{
                        width: `${value}%`,
                    }}
                    data-cy="record-modal-div-17"
                />
            </div>
        </div>
    );
}

// ─── Form-state helpers ────────────────────────────────────────────────────────

function buildInitialValues<T extends object>(
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
function seedFieldValue<T extends object>(
    f: FieldDef<T>,
    mode: ModalMode,
    row?: T,
): unknown {
    // File fields carry a FileFieldValue, not a scalar. In edit mode hydrate
    // `existing` from whatever the row holds (a URL string or a media object).
    if (f.type === 'file') {
        const raw =
            mode === 'edit' && row
                ? (row as Record<string, unknown>)[f.key]
                : null;
        return {
            existing: normalizeExistingFiles(raw),
            files: [],
            removedIds: [],
        };
    }
    if (mode === 'edit' && row) {
        let val = (row as Record<string, unknown>)[f.key];

        // Normalize array to first item for async-select
        if (f.type === 'async-select' && Array.isArray(val)) {
            val = val[0] ?? '';
        }
        return val ?? '';
    }
    return f.defaultValue ?? (f.type === 'checkbox' ? false : '');
}
function collectErrors<T extends object>(
    fields: FieldDef<T>[],
    values: Record<string, unknown>,
): Record<string, string> {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
        const value = values[f.key];
        if (
            f.required &&
            (value === '' || value === null || value === undefined)
        ) {
            errs[f.key] = `${f.label} is required.`;
            return;
        }
        const customErr = f.validate?.(value, values);
        if (customErr) {
            errs[f.key] = customErr;
        }
    });
    return errs;
}

function mapApiErrors(
    apiErrors: Record<string, string[]>,
): Record<string, string> {
    const mapped: Record<string, string> = {};
    Object.entries(apiErrors).forEach(([key, msgs]) => {
        mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
    });
    return mapped;
}
