/**
 * @file components/form-modal/FormModalBody.tsx
 * The Formik-driven form body rendered inside ModalCenter/ModalSide. Receives
 * its field config via the shell's `data` prop (kept out of Formik state so the
 * component stays stable) and reads/writes form values from Formik context.
 * Each field is rendered by the shared <DynamicField> (RecordModalField).
 */

import type { ModalComponentProps } from '@/components/modal/ModalCenter';
import { DynamicField } from '@/components/table/components/RecordModalField';
import { isFieldDisabled, isFieldVisible } from '@/components/table/utils';
import { useFormikContext } from 'formik';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import type { FormModalConfig } from './types';

type Values = Record<string, unknown>;

export function FormModalBody({
    data,
    close,
}: ModalComponentProps<FormModalConfig>) {
    const formik = useFormikContext<Values>();

    const visibleFields = useMemo(
        () =>
            (data?.fields ?? []).filter((f) =>
                isFieldVisible(f, data?.mode ?? 'create', data?.row),
            ),
        [data],
    );

    if (!data) {
        return null;
    }

    const { mode, row, submitLabel, cancelLabel, uploadProgress } = data;

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
        >
            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
                {visibleFields.map((f) => (
                    <div
                        key={f.key}
                        className={f.colSpan === 2 ? 'sm:col-span-2' : ''}
                    >
                        <DynamicField
                            field={f}
                            value={formik.values[f.key]}
                            error={
                                formik.touched[f.key] || formik.submitCount > 0
                                    ? (formik.errors[f.key] as
                                          string | undefined)
                                    : undefined
                            }
                            disabled={
                                formik.isSubmitting ||
                                isFieldDisabled(f, mode, row)
                            }
                            initialLabel={
                                mode === 'edit' && row
                                    ? f.initialLabel?.(row)
                                    : undefined
                            }
                            onChange={(v) => formik.setFieldValue(f.key, v)}
                        />
                    </div>
                ))}
            </div>

            {formik.status && (
                <p className="mx-6 rounded-md bg-danger-50 px-3 py-2 text-xs text-danger-600">
                    {String(formik.status)}
                </p>
            )}

            {uploadProgress != null && (
                <div className="px-6 pb-2">
                    <div className="mb-1 flex items-center justify-between text-xs font-medium text-neutral-500">
                        <span>
                            {uploadProgress >= 100
                                ? 'Processing…'
                                : 'Uploading…'}
                        </span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                            className="h-full rounded-full bg-brand-500 transition-[width] duration-200 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="mt-auto flex w-full items-center gap-2 border-t border-neutral-100 px-6 py-4">
                <button
                    type="button"
                    onClick={close}
                    disabled={formik.isSubmitting}
                    className="inline-flex w-2/3 justify-center rounded-md border border-neutral-200 px-4 py-2 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                >
                    {cancelLabel}
                </button>
                <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
                >
                    {formik.isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

export default FormModalBody;
