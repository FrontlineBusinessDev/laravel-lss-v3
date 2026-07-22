import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import type { AppBatches } from '@/types/modules/batches/batches';
import { loadLookupOptions } from '@/types/reusable/fields';
import {
    Field,
    formatDate,
    inputCls,
    ReadonlyField,
    SetupToggle,
} from './CreateBatchFields';

/**
 * Unified Create/Edit batch modal. Passing `batch` switches it into edit mode
 * (PUT /batches/{id}); omitting it creates (POST /batches). The layout matches
 * docs/img/screencapture-localhost-8000-batches-2026-07-07-14_05_07.png.
 *
 * Two entry points share this one modal:
 *  - the batches list, via DataTableField's `renderModal` (pass `onSubmit`, which
 *    persists + toasts + refreshes the table + closes the modal), and
 *  - the batch detail page (no `onSubmit` → it persists itself via apiFetchJson).
 */
type Values = {
    setup: 'f2f' | 'online';
    academic_program_id: string | number;
    academic_industry_id: string | number;
    date_started: string;
    projected_end_date: string;
    is_public_url_enable: boolean;
};

// The three async-select lookups are structurally identical — drive them from
// one config instead of three near-duplicate JSX blocks. `rel` is the
// eager-loaded relation the trigger label is seeded from in edit mode.
const LOOKUPS = [
    {
        key: 'academic_program_id',
        rel: 'academic_program',
        label: 'Program type',
        endpoint: '/settings/academic/program',
        placeholder: 'Select program type',
    },
    {
        key: 'academic_industry_id',
        rel: 'academic_industry',
        label: 'Industry',
        endpoint: '/settings/academic/industry',
        placeholder: 'Select industry',
    },
] as const satisfies ReadonlyArray<{
    key: keyof Values;
    rel: string;
    label: string;
    endpoint: string;
    placeholder: string;
}>;
export function CreateBatchModal({
    open,
    onClose,
    batch,
    mode: modeProp,
    onSubmit,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    batch?: AppBatches;
    mode?: 'create' | 'edit';
    /** When set, delegates persistence to the caller (DataTableField path). */
    onSubmit?: (values: Record<string, unknown>) => Promise<void>;
    onSaved?: (saved: AppBatches) => void;
}) {
    const { showToast } = useToast();
    const isEdit = (modeProp ?? (batch ? 'edit' : 'create')) === 'edit';
    const [values, setValues] = useState<Values>(() => ({
        setup: batch?.setup ?? 'f2f',
        academic_program_id: batch?.academic_program_id ?? '',
        academic_industry_id: batch?.academic_industry_id ?? '',
        date_started: batch?.date_started
            ? String(batch.date_started).slice(0, 10)
            : '',
        projected_end_date: batch?.projected_end_date
            ? String(batch.projected_end_date).slice(0, 10)
            : '',
        is_public_url_enable: batch?.is_public_url_enable ?? false,
    }));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    if (!open) {
        return null;
    }
    const set = <K extends keyof Values>(key: K, value: Values[K]) => {
        setValues((prev) => ({
            ...prev,
            [key]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [key]: '',
        }));
    };
    const validate = () => {
        const next: Record<string, string> = {};
        if (!values.academic_program_id) {
            next.academic_program_id = 'Program type is required.';
        }
        if (!values.academic_industry_id) {
            next.academic_industry_id = 'Industry is required.';
        }
        if (!values.date_started) {
            next.date_started = 'Start date is required.';
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };
    const persist = async () => {
        // DataTableField owns persistence + toast + list refresh + close.
        if (onSubmit) {
            await onSubmit({
                ...values,
            });
            return;
        }
        const url = batch ? `/batches/${batch.id}` : '/batches';
        const response = await apiFetchJson<AppBatches>(url, {
            method: batch ? 'PUT' : 'POST',
            body: JSON.stringify(values),
        });
        showToast(batch ? 'Batch updated' : 'Batch created', 'success');
        onSaved?.(response.data);
        onClose();
    };
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!validate()) {
            return;
        }
        setSubmitting(true);
        try {
            await persist();
        } catch (err: unknown) {
            const error =
                err instanceof Error ? err : new Error('Failed to save batch.');
            const apiErrors = (
                error as Error & {
                    errors?: Record<string, string[]>;
                }
            ).errors;
            if (apiErrors) {
                const mapped: Record<string, string> = {};
                Object.entries(apiErrors).forEach(([key, msgs]) => {
                    mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
                });
                setErrors((prev) => ({
                    ...prev,
                    ...mapped,
                }));
            }
            setFormError(error.message);
        } finally {
            setSubmitting(false);
        }
    };
    const createdDate = batch?.created_at
        ? formatDate(new Date(batch.created_at))
        : formatDate(new Date());
    return (
        <Modal
            open={open}
            onClose={onClose}
            maxWidth={520}
            title={isEdit ? 'Edit batch' : 'Add batch'}
            description="Batch number and created date are generated automatically by the system."
            data-cy="create-batch-modal-modal-close"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
                data-cy="create-batch-modal-form-submit"
            >
                <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    data-cy="create-batch-modal-div-3"
                >
                    <ReadonlyField
                        label="Batch number"
                        mono
                        value={batch?.batch_code ?? 'Generated on creation'}
                        data-cy="create-batch-modal-readonly-field-batch-number"
                    />
                    <ReadonlyField
                        label="Created date"
                        value={createdDate}
                        data-cy="create-batch-modal-readonly-field-created-date"
                    />
                </div>

                <Field label="Setup" data-cy="create-batch-modal-field-setup">
                    <SetupToggle
                        value={values.setup}
                        onChange={(v) => set('setup', v)}
                        data-cy="create-batch-modal-setup-toggle-set"
                    />
                </Field>

                {LOOKUPS.map((lookup) => (
                    <Field
                        key={lookup.key}
                        label={lookup.label}
                        error={errors[lookup.key]}
                        data-cy="create-batch-modal-field-lookup-label"
                    >
                        <AsyncSelectField
                            value={values[lookup.key]}
                            onChange={(v) => set(lookup.key, v as string)}
                            loadOptions={(q) =>
                                loadLookupOptions(lookup.endpoint, q)
                            }
                            initialLabel={
                                (
                                    batch?.[lookup.rel] as {
                                        name?: string;
                                    } | null
                                )?.name
                            }
                            placeholder={lookup.placeholder}
                            error={errors[lookup.key]}
                            data-cy="create-batch-modal-async-select-field-lookup-placeholder"
                        />
                    </Field>
                ))}

                <Field
                    label="Start date"
                    error={errors.date_started}
                    data-cy="create-batch-modal-field-start-date"
                >
                    <input
                        type="date"
                        value={values.date_started}
                        onChange={(e) => set('date_started', e.target.value)}
                        className={inputCls}
                        data-cy="create-batch-modal-input-date"
                    />
                </Field>

                <Field
                    label="Projected end date"
                    error={errors.projected_end_date}
                    data-cy="create-batch-modal-field-projected-end-date"
                >
                    <input
                        type="date"
                        value={values.projected_end_date}
                        onChange={(e) =>
                            set('projected_end_date', e.target.value)
                        }
                        className={inputCls}
                        data-cy="create-batch-modal-input-projected-end-date"
                    />
                </Field>

                <label
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-neutral-200 px-3 py-2.5"
                    data-cy="create-batch-modal-label-12"
                >
                    <input
                        type="checkbox"
                        checked={values.is_public_url_enable}
                        onChange={(e) =>
                            set('is_public_url_enable', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-100"
                        data-cy="create-batch-modal-input-checkbox"
                    />
                    <span
                        className="text-sm font-medium text-neutral-700"
                        data-cy="create-batch-modal-span-enable-public-registration-url"
                    >
                        Enable public registration URL
                    </span>
                </label>

                {formError && (
                    <p
                        className="text-danger-700 rounded-md bg-danger-50 px-3 py-2 text-xs"
                        data-cy="create-batch-modal-p-15"
                    >
                        {formError}
                    </p>
                )}

                <div
                    className="flex items-center justify-end gap-2 pt-2"
                    data-cy="create-batch-modal-div-16"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                        data-cy="create-batch-modal-button-button"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
                        data-cy="create-batch-modal-button-submit"
                    >
                        {submitting && (
                            <Loader2
                                className="h-4 w-4 animate-spin"
                                data-cy="create-batch-modal-loader2-19"
                            />
                        )}
                        {isEdit ? 'Save changes' : 'Create batch'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
