import type { ReactNode } from 'react';

/**
 * Shared form-field atoms — the single source of truth for label / input / error
 * styling used by both the batch create/edit modal (CreateBatchModal) and the
 * generic DataTableField record modal (RecordModal). Extracted here so the two
 * modals stay visually identical without duplicating the utility strings.
 */
export const labelCls = 'mb-1.5 block text-sm font-medium text-neutral-700';

/** Single-line input / select styling. */
export const inputCls =
    'w-full rounded-md border border-neutral-200 bg-white px-2.5 h-9 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-neutral-50';

/** Multi-line textarea styling (same look, no fixed height, no resize handle). */
export const textareaCls =
    'w-full rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-neutral-50 resize-none';

/** "Mon D, YYYY" — the read-only Created-date display format. */
export const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
export function Field({
    label,
    error,
    required,
    helpText,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    helpText?: string;
    children: ReactNode;
}) {
    return (
        <div data-cy="field-div-1" className="relative">
            <label className={labelCls} data-cy="field-label-2">
                {label}
                {required && (
                    <span
                        className="ml-0.5 text-danger-600"
                        data-cy="field-span-3"
                    >
                        *
                    </span>
                )}
            </label>
            {children}
            {error && (
                <p
                    className="absolute top-0.5 right-0 mt-1 text-xs text-danger-600"
                    data-cy="field-p-5"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
export function ReadonlyField({
    label,
    value,
    mono,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div data-cy="field-div-6">
            <label className={labelCls} data-cy="field-label-7">
                {label}
            </label>
            <div
                className={`flex h-9 items-center rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 ${mono ? 'font-mono' : ''}`}
                data-cy="field-div-8"
            >
                {value}
            </div>
        </div>
    );
}
