import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import type { AppBatches } from '@/types/modules/batches/batches';
import { loadLookupOptions } from '@/types/reusable/fields';
import {
    errorInputCls,
    Field,
    formatDate,
    inputCls,
    ReadonlyField,
    SetupToggle,
} from './CreateBatchFields';

/**
 * Unified Create/Edit batch modal. Passing `batch` switches it into edit mode
 * (POST /batches/{id}); omitting it creates (POST /batches). The layout matches
 * docs/img/screencapture-localhost-8000-batches-2026-07-07-14_05_07.png.
 *
 * Two entry points share this one modal:
 *  - the batches list, via DataTableField's `renderModal` (pass `onSubmit`, which
 *    persists + toasts + refreshes the table + closes the modal), and
 *  - the batch detail page (no `onSubmit` → it persists itself via apiFetchJson).
 */
interface FormValues {
    setup: 'f2f' | 'online';
    academic_program_type_id: string;
    academic_industry_id: string;
    date_started: string;
    projected_end_date: string;
    is_public_url_enable: boolean;
}

const emptyValues: FormValues = {
    setup: 'f2f',
    academic_program_type_id: '',
    academic_industry_id: '',
    date_started: '',
    projected_end_date: '',
    is_public_url_enable: false,
};

function valuesFromBatch(batch: AppBatches): FormValues {
    return {
        setup: batch.setup ?? 'f2f',
        academic_program_type_id: batch.academic_program_type_id
            ? String(batch.academic_program_type_id)
            : '',
        academic_industry_id: batch.academic_industry_id
            ? String(batch.academic_industry_id)
            : '',
        date_started: batch.date_started
            ? String(batch.date_started).slice(0, 10)
            : '',
        projected_end_date: batch.projected_end_date
            ? String(batch.projected_end_date).slice(0, 10)
            : '',
        is_public_url_enable: batch.is_public_url_enable ?? false,
    };
}

// Mirrors BatchesController::storeRules()/updateRules(): setup/is_public_url_enable/
// date_started/academic_industry_id/academic_program_type_id required;
// projected_end_date is nullable but must be on/after date_started when set.
const batchSchema = z
    .object({
        setup: z.enum(['f2f', 'online']),
        academic_program_type_id: z
            .string()
            .min(1, 'Academic program type is required.'),
        academic_industry_id: z.string().min(1, 'Industry is required.'),
        date_started: z.string().min(1, 'Start date is required.'),
        projected_end_date: z.string(),
        is_public_url_enable: z.boolean(),
    })
    .refine(
        (v) =>
            !v.projected_end_date ||
            !v.date_started ||
            v.projected_end_date >= v.date_started,
        {
            message: 'Projected end date must be on or after the start date.',
            path: ['projected_end_date'],
        },
    ) satisfies z.ZodType<FormValues>;

// The async-select lookups are structurally identical — drive them from one
// config instead of near-duplicate JSX blocks. `rel` is the eager-loaded
// relation the trigger label is seeded from in edit mode. Academic Program
// and Academic Level are collected at trainee self-registration instead (see
// resources/js/pages/public/register) — Academic Program Type lives here.
const LOOKUPS = [
    {
        key: 'academic_program_type_id',
        rel: 'academic_program_type',
        label: 'Academic program type',
        endpoint: '/settings/academic/program-type',
        placeholder: 'Select academic program type',
    },
    {
        key: 'academic_industry_id',
        rel: 'academic_industry',
        label: 'Industry',
        endpoint: '/settings/academic/industry',
        placeholder: 'Select industry',
    },
] as const satisfies ReadonlyArray<{
    key: keyof FormValues;
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
    const {
        control,
        register,
        reset,
        handleSubmit: handleFormSubmit,
        formState: { errors, isSubmitting: submitting },
    } = useForm<FormValues>({
        resolver: zodResolver(batchSchema),
        defaultValues: emptyValues,
    });
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        reset(batch ? valuesFromBatch(batch) : emptyValues);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- clears a stale error from a previous open, same as AddTaskModal's reset-on-open effect
        setFormError(null);
    }, [open, batch, reset]);

    if (!open) {
        return null;
    }

    const persist = async (values: FormValues) => {
        const payload = {
            ...values,
            academic_program_type_id: Number(values.academic_program_type_id),
            academic_industry_id: Number(values.academic_industry_id),
        };

        // DataTableField owns persistence + toast + list refresh + close.
        if (onSubmit) {
            await onSubmit(payload);

            return;
        }

        const url = batch ? `/batches/${batch.id}` : '/batches';
        const response = await apiFetchJson<AppBatches>(url, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        showToast(batch ? 'Batch updated' : 'Batch created', 'success');
        onSaved?.(response.data);
        onClose();
    };

    async function onValid(values: FormValues) {
        setFormError(null);

        try {
            await persist(values);
        } catch (err: unknown) {
            setFormError(
                err instanceof Error ? err.message : 'Failed to save batch.',
            );
        }
    }

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
                onSubmit={handleFormSubmit(onValid)}
                className="space-y-0"
                data-cy="create-batch-modal-form-submit"
            >
                <div
                    className="mb-3 grid grid-cols-1 gap-4 sm:grid-cols-2"
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
                    <Controller
                        control={control}
                        name="setup"
                        render={({ field }) => (
                            <SetupToggle
                                value={field.value}
                                onChange={field.onChange}
                                data-cy="create-batch-modal-setup-toggle-set"
                            />
                        )}
                    />
                </Field>

                {LOOKUPS.map((lookup) => (
                    <Field
                        key={lookup.key}
                        label={lookup.label}
                        error={errors[lookup.key]?.message}
                        data-cy="create-batch-modal-field-lookup-label"
                    >
                        <Controller
                            control={control}
                            name={lookup.key}
                            render={({ field }) => (
                                <AsyncSelectField
                                    value={field.value}
                                    onChange={(v) =>
                                        field.onChange((v as string) ?? '')
                                    }
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
                                    error={errors[lookup.key]?.message}
                                    data-cy="create-batch-modal-async-select-field-lookup-placeholder"
                                />
                            )}
                        />
                    </Field>
                ))}

                <div
                    className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2"
                    data-cy="create-batch-modal-div-dates"
                >
                    <Field
                        label="Start date"
                        error={errors.date_started?.message}
                        data-cy="create-batch-modal-field-start-date"
                    >
                        <input
                            type="date"
                            className={cn(
                                inputCls,
                                errors.date_started && errorInputCls,
                            )}
                            {...register('date_started')}
                            data-cy="create-batch-modal-input-date"
                        />
                    </Field>

                    <Field
                        label="Projected end date"
                        required={false}
                        error={errors.projected_end_date?.message}
                        data-cy="create-batch-modal-field-projected-end-date"
                    >
                        <input
                            type="date"
                            className={cn(
                                inputCls,
                                errors.projected_end_date && errorInputCls,
                            )}
                            {...register('projected_end_date')}
                            data-cy="create-batch-modal-input-projected-end-date"
                        />
                    </Field>
                </div>

                <label
                    className="mb-3 flex cursor-pointer items-center gap-2.5 rounded-lg border border-neutral-200 px-3 py-2.5"
                    data-cy="create-batch-modal-label-12"
                >
                    <input
                        type="checkbox"
                        {...register('is_public_url_enable')}
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
                        className="text-danger-700 mb-3 rounded-md bg-danger-50 px-3 py-2 text-xs"
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
