/**
 * @file components/RecordModal.tsx
 * Dynamic create / edit modal driven entirely by a `fields` array.
 *
 * Responsibilities:
 *  - Initialise form values from the row (edit) or field.defaultValue (create)
 *  - Client-side validation via field.validate callbacks
 *  - Maps API error responses back to per-field error messages
 *  - Renders the right input type via <DynamicField>
 */

import { Loader2, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { useScrollLock } from '@/hooks/use-scroll-lock';
import type { FieldDef, ModalMode } from '../types';
import { isFieldDisabled, isFieldVisible } from '../utils';

// ─── RecordModal ──────────────────────────────────────────────────────────────

interface RecordModalProps<T> {
    mode: ModalMode;
    row?: T;
    fields: FieldDef<T>[];
    title: string;
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
    onClose,
    onSubmit,
    onError,
}: RecordModalProps<T>) {
    // Only show fields relevant to the current mode (create vs edit)
    const visibleFields = useMemo(
        () => fields.filter((f) => isFieldVisible(f, mode, row)),
        [fields, mode, row],
    );

    // Seed form values: existing row data in edit mode, defaultValue in create mode
    const initialValues = useMemo(() => {
        const init: Record<string, unknown> = {};
        visibleFields.forEach((f) => {
            if (mode === 'edit' && row) {
                let val = (row as Record<string, unknown>)[f.key];

                // Normalize array to first item for async-select
                if (f.type === 'async-select' && Array.isArray(val)) {
                    val = val[0] ?? '';
                }

                init[f.key] = val ?? '';
            } else {
                init[f.key] =
                    f.defaultValue ?? (f.type === 'checkbox' ? false : '');
            }
        });

        return init;
    }, [visibleFields, mode, row]);

    const [values, setValues] =
        useState<Record<string, unknown>>(initialValues);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    // This modal is only mounted while open, so lock scroll unconditionally.
    useScrollLock(true);

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKey);

        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const setValue = (key: string, value: unknown) => {
        setValues((prev) => ({ ...prev, [key]: value }));
        setFieldErrors((prev) => ({ ...prev, [key]: '' })); // clear per-field error on change
    };

    /** Runs required-check + custom validators. Returns false when any fail. */
    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        visibleFields.forEach((f) => {
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

            // Map Laravel validation errors ({ field: [msg, ...] }) back to fields
            const apiErrors = (
                error as Error & { errors?: Record<string, string[]> }
            ).errors;

            if (apiErrors) {
                const mapped: Record<string, string> = {};
                Object.entries(apiErrors).forEach(([key, msgs]) => {
                    mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
                });
                setFieldErrors((prev) => ({ ...prev, ...mapped }));
            }

            setFormError(error.message);
            onError?.(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background shadow-xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 hover:bg-slate-100/30"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
                        {visibleFields.map((f) => (
                            <div
                                key={f.key}
                                className={
                                    f.colSpan === 2
                                        ? 'col-span-1 sm:col-span-2'
                                        : 'col-span-1'
                                }
                            >
                                <DynamicField
                                    field={f}
                                    value={values[f.key]}
                                    error={fieldErrors[f.key]}
                                    disabled={
                                        submitting ||
                                        isFieldDisabled(f, mode, row)
                                    }
                                    onChange={(v) => setValue(f.key, v)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* General form error (non-field API errors) */}
                    {formError && (
                        <div className="mx-6 mb-4 rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-600">
                            {formError}
                        </div>
                    )}

                    {/* Footer actions */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50/20"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
                        >
                            {submitting && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            {mode === 'create' ? 'Create' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── DynamicField ─────────────────────────────────────────────────────────────

/**
 * Renders the correct input element for a FieldDef.
 *
 * Supported types: text, number, email, password, date, datetime-local,
 *                  textarea, select, checkbox, async-select.
 *
 * The async-select branch delegates to your existing <AsyncSelectField> hook.
 */
function DynamicField<T>({
    field,
    value,
    error,
    disabled,
    onChange,
}: {
    field: FieldDef<T>;
    value: unknown;
    error?: string;
    disabled?: boolean;
    onChange: (value: unknown) => void;
}) {
    const base =
        'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 ';
    const border = error
        ? 'border-rose-300 focus:border-rose-400'
        : 'border-slate-200 focus:border-slate-300';

    // ── async-select ──────────────────────────────────────────────────────────
    if (field.type === 'async-select') {
        // Lazy import to avoid bundling AsyncSelectField when unused
        return (
            <>
                <span className="mb-1 block text-xs font-medium">
                    {field.label}
                    {field.required && (
                        <span className="ml-0.5 text-rose-500">*</span>
                    )}
                </span>
                <AsyncSelectField
                    value={value}
                    onChange={onChange}
                    loadOptions={field.loadOptions!}
                    getOptionLabel={field.getOptionLabel}
                    placeholder={field.placeholder}
                    debounceMs={field.debounceMs}
                    minSearchLength={field.minSearchLength}
                    disabled={disabled}
                    error={error}
                />
            </>
        );
    }

    // ── checkbox ──────────────────────────────────────────────────────────────
    if (field.type === 'checkbox') {
        return (
            <label className="flex cursor-pointer items-center gap-2">
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm font-medium">{field.label}</span>
            </label>
        );
    }

    // ── all other inputs ──────────────────────────────────────────────────────
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium">
                {field.label}
                {field.required && (
                    <span className="ml-0.5 text-rose-500">*</span>
                )}
            </span>

            {field.type === 'textarea' ? (
                <textarea
                    rows={3}
                    value={(value as string) ?? ''}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${base}${border} resize-none`}
                />
            ) : field.type === 'select' ? (
                <select
                    value={(value as string | number) ?? ''}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${base}${border}`}
                >
                    <option value="" disabled>
                        {field.placeholder ??
                            `Select ${field.label.toLowerCase()}…`}
                    </option>
                    {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={field.type ?? 'text'}
                    value={(value as string | number) ?? ''}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                        onChange(
                            field.type === 'number'
                                ? e.target.valueAsNumber
                                : e.target.value,
                        )
                    }
                    className={`${base}${border}`}
                />
            )}

            {field.helpText && !error && (
                <span className="mt-1 block text-xs text-slate-500">
                    {field.helpText}
                </span>
            )}
            {error && (
                <span className="mt-1 block text-xs text-rose-500">
                    {error}
                </span>
            )}
        </label>
    );
}
