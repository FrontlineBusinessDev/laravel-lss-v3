import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Check, Loader2, Pencil, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { traineeService } from '@/api-service-layer/admin/trainee';
import { ApiError } from '@/api-service-layer/client';
import { Button } from '@/components/Button';
import { errorInputCls, Field as FormField, inputCls, textareaCls } from '@/components/form/Field';
import { RequiredHoursCompletedPill } from '@/components/RatingsBadges';
import { useToast } from '@/components/Toast';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';
import { formatDate } from '@/lib/date';
import { formatToTwoDecimals } from '@/lib/number';
import { getHoursProgress } from '@/lib/ratings';
import { cn } from '@/lib/utils';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { loadLookupOptions } from '@/types/reusable/fields';

// Readonly display atom for the always-visible summary fields that share this
// tab's grid with the edit-mode FormField selects (school/program/level).
// `mb-1` keeps it legible now that the grid runs gap-y-0 — FormField's own
// message slot is the only other vertical spacer in that grid, and this atom
// has no slot of its own.
function Field({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div className="mb-1" data-cy="academic-info-tab-div-1">
            <div
                className="flex items-center gap-1.5 text-xs text-neutral-500"
                data-cy="academic-info-tab-div-2"
            >
                {label}
                {hint && (
                    <span
                        className="text-neutral-400"
                        data-cy="academic-info-tab-span-3"
                    >
                        ({hint})
                    </span>
                )}
            </div>
            <div
                className="mt-1 text-sm text-ink"
                data-cy="academic-info-tab-div-4"
            >
                {value || '—'}
            </div>
        </div>
    );
}

type Values = {
    required_hours: string;
    date_completed: string;
    termination_remarks: string;
    school_id: string | number;
    academic_program_id: string | number;
    academic_level_id: string | number;
};

// Mirrors TraineesController::updateRules() for the fields this tab edits:
// school_id/academic_program_id/academic_level_id required + exists (lookup
// existence enforced server-side, client only checks presence);
// required_hours required numeric 0-999.99; date_completed nullable date;
// termination_remarks nullable string.
const academicInfoSchema = z.object({
    required_hours: z
        .string()
        .min(1, 'Required hours is required.')
        .refine(
            (v) =>
                !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 999.99,
            'Required hours must be a number between 0 and 999.99.',
        ),
    date_completed: z.string(),
    termination_remarks: z.string(),
    school_id: z.union([z.string(), z.number()]),
    academic_program_id: z.union([z.string(), z.number()]),
    academic_level_id: z.union([z.string(), z.number()]),
}) satisfies z.ZodType<Values>;
const academicInfoFormSchema = academicInfoSchema.superRefine((values, ctx) => {
    if (!values.school_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['school_id'],
            message: 'School is required.',
        });
    }

    if (!values.academic_program_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['academic_program_id'],
            message: 'Academic program is required.',
        });
    }

    if (!values.academic_level_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['academic_level_id'],
            message: 'Academic level is required.',
        });
    }
});

// The async-select lookups are structurally identical — drive them from one
// config instead of near-duplicate JSX blocks (mirrors CreateBatchModal's
// LOOKUPS pattern). `rel` is the eager-loaded relation the trigger label is
// seeded from in edit mode.
const LOOKUPS = [
    {
        key: 'school_id',
        rel: 'school',
        label: 'School',
        endpoint: '/settings/partner-schools',
        columnNameShow: 'school_name',
        placeholder: 'Select school',
    },
    {
        key: 'academic_program_id',
        rel: 'academic_program',
        label: 'Academic program',
        endpoint: '/settings/academic/program',
        columnNameShow: undefined,
        placeholder: 'Select academic program',
    },
    {
        key: 'academic_level_id',
        rel: 'academic_level',
        label: 'Academic level',
        endpoint: '/settings/academic/level',
        columnNameShow: undefined,
        placeholder: 'Select academic level',
    },
] as const satisfies ReadonlyArray<{
    key: keyof Values;
    rel: 'school' | 'academic_program' | 'academic_level';
    label: string;
    endpoint: string;
    columnNameShow?: string;
    placeholder: string;
}>;

export default function AcademicInfoTab({
    trainee,
}: {
    trainee: TraineeDetail;
}) {
    const { showToast } = useToast();
    const [editing, setEditing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [saved, setSaved] = useState<Values>({
        required_hours: trainee.required_hours,
        date_completed: trainee.date_completed ?? '',
        termination_remarks: trainee.termination_remarks ?? '',
        school_id: trainee.school_id,
        academic_program_id: trainee.academic_program_id ?? '',
        academic_level_id: trainee.academic_level_id ?? '',
    });
    const {
        control,
        register,
        setError,
        reset,
        handleSubmit: handleFormSubmit,
        formState: { errors, isSubmitting: saving },
    } = useForm<Values>({
        resolver: zodResolver(academicInfoFormSchema),
        defaultValues: saved,
    });

    const startEdit = () => {
        reset(saved);
        setFormError(null);
        setEditing(true);
    };
    const cancel = () => {
        reset(saved);
        setFormError(null);
        setEditing(false);
    };
    const onValid = async (values: Values) => {
        setFormError(null);

        try {
            await traineeService.update(trainee.id, {
                ...trainee,
                required_hours: values.required_hours,
                date_completed: values.date_completed || null,
                termination_remarks: values.termination_remarks,
                school_id: Number(values.school_id),
                academic_program_id: Number(values.academic_program_id),
                academic_level_id: Number(values.academic_level_id),
            });
            setSaved(values);
            setEditing(false);
            showToast('Academic information updated', 'success');
            router.reload({ only: ['trainee'] });
        } catch (error) {
            if (error instanceof ApiError && error.errors) {
                Object.entries(error.errors).forEach(([key, msgs]) => {
                    setError(key as keyof Values, {
                        message: Array.isArray(msgs) ? msgs[0] : String(msgs),
                    });
                });
            }

            setFormError(
                error instanceof ApiError ? error.message : 'Failed to save changes',
            );
        }
    };
    const hours = getHoursProgress(
        trainee.tasks_sum_time_spent,
        saved.required_hours,
    );

    return (
        <>
            <TraineesDetailLayout trainee={trainee}>
                <div
                    className="rounded-lg border border-neutral-200 bg-white p-5"
                    data-cy="academic-info-tab-div-5"
                >
                    <div
                        className="mb-4 flex items-start justify-between gap-3"
                        data-cy="academic-info-tab-div-6"
                    >
                        <h3
                            className="text-sm font-semibold text-ink"
                            data-cy="academic-info-tab-h3-academic-internship-information"
                        >
                            Academic & internship information
                        </h3>
                        {!editing ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={Pencil}
                                onClick={startEdit}
                                data-cy="academic-info-tab-button-start-edit"
                            >
                                Edit
                            </Button>
                        ) : (
                            <div
                                className="flex gap-2"
                                data-cy="academic-info-tab-div-9"
                            >
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={X}
                                    onClick={cancel}
                                    disabled={saving}
                                    data-cy="academic-info-tab-button-cancel"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={saving ? undefined : Check}
                                    onClick={handleFormSubmit(onValid)}
                                    disabled={saving}
                                    data-cy="academic-info-tab-button-save"
                                >
                                    {saving && (
                                        <Loader2
                                            size={13}
                                            className="mr-1 animate-spin"
                                        />
                                    )}
                                    {saving ? 'Saving…' : 'Save changes'}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div
                        className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2 lg:grid-cols-3"
                        data-cy="academic-info-tab-div-12"
                    >
                        {editing ? (
                            LOOKUPS.map((lookup) => (
                                <Controller
                                    key={lookup.key}
                                    control={control}
                                    name={lookup.key}
                                    render={({ field }) => (
                                        <FormField
                                            label={lookup.label}
                                            error={errors[lookup.key]?.message}
                                            data-cy={`academic-info-tab-field-${lookup.key}`}
                                        >
                                            <AsyncSelectField
                                                value={field.value}
                                                onChange={(v) =>
                                                    field.onChange(
                                                        v as Values[typeof lookup.key],
                                                    )
                                                }
                                                loadOptions={(q) =>
                                                    loadLookupOptions(
                                                        lookup.endpoint,
                                                        q,
                                                        lookup.columnNameShow,
                                                    )
                                                }
                                                initialLabel={
                                                    (
                                                        trainee[lookup.rel] as {
                                                            name?: string;
                                                            school_name?: string;
                                                        } | null
                                                    )?.name ??
                                                    (
                                                        trainee[lookup.rel] as {
                                                            school_name?: string;
                                                        } | null
                                                    )?.school_name
                                                }
                                                placeholder={lookup.placeholder}
                                                error={errors[lookup.key]?.message}
                                            />
                                        </FormField>
                                    )}
                                />
                            ))
                        ) : (
                            <>
                                <Field
                                    label="School"
                                    value={trainee.school?.school_name ?? ''}
                                    data-cy="academic-info-tab-field-school"
                                />
                                <Field
                                    label="Academic program"
                                    value={trainee.academic_program?.name ?? ''}
                                    data-cy="academic-info-tab-field-academic-program"
                                />
                                <Field
                                    label="Academic level"
                                    value={trainee.academic_level?.name ?? ''}
                                    data-cy="academic-info-tab-field-academic-level"
                                />
                            </>
                        )}
                        <Field
                            label="Program type"
                            value={
                                trainee.batch?.academic_program_type?.name ?? ''
                            }
                            data-cy="academic-info-tab-field-program-type"
                        />
                        <Field
                            label="Industry"
                            value={trainee.batch?.academic_industry?.name ?? ''}
                            data-cy="academic-info-tab-field-industry"
                        />
                        <Field
                            label="Date started"
                            value={formatDate(trainee.batch?.date_started)}
                            hint="from batch"
                            data-cy="academic-info-tab-field-date-started"
                        />
                    </div>

                    {!editing ? (
                        <div
                            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                            data-cy="academic-info-tab-div-12b"
                        >
                            <Field
                                label="Required hours"
                                value={`${formatToTwoDecimals(hours.required)} hrs`}
                                data-cy="academic-info-tab-field-required-hours"
                            />
                            <Field
                                label="Date completed"
                                value={formatDate(saved.date_completed)}
                                hint="auto-computed, editable"
                                data-cy="academic-info-tab-field-date-completed"
                            />
                        </div>
                    ) : (
                        <div
                            className="mt-4 grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2 lg:grid-cols-3"
                            data-cy="academic-info-tab-div-21"
                        >
                            <FormField
                                label="Required hours"
                                error={errors.required_hours?.message}
                                data-cy="academic-info-tab-text-field-required-hours"
                            >
                                <input
                                    type="number"
                                    min={0}
                                    className={cn(
                                        inputCls,
                                        errors.required_hours && errorInputCls,
                                    )}
                                    {...register('required_hours')}
                                    data-cy="academic-info-tab-input-required-hours"
                                />
                            </FormField>
                            <FormField
                                label="Date completed"
                                required={false}
                                error={errors.date_completed?.message}
                                data-cy="academic-info-tab-text-field-date-completed"
                            >
                                <input
                                    type="date"
                                    className={cn(
                                        inputCls,
                                        errors.date_completed && errorInputCls,
                                    )}
                                    {...register('date_completed')}
                                    data-cy="academic-info-tab-input-date-completed"
                                />
                            </FormField>
                            <div
                                className="sm:col-span-2 lg:col-span-3"
                                data-cy="academic-info-tab-div-30"
                            >
                                <FormField
                                    label="Termination remarks"
                                    required={false}
                                    error={errors.termination_remarks?.message}
                                    data-cy="academic-info-tab-text-area-field-termination-remarks"
                                >
                                    <textarea
                                        placeholder="Only applies if the trainee was terminated"
                                        className={cn(
                                            textareaCls,
                                            errors.termination_remarks &&
                                                errorInputCls,
                                        )}
                                        {...register('termination_remarks')}
                                        data-cy="academic-info-tab-textarea-termination-remarks"
                                    />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {formError && (
                        <p
                            className="text-danger-700 mt-3 rounded-md bg-danger-50 px-3 py-2 text-xs"
                            data-cy="academic-info-tab-p-form-error"
                        >
                            {formError}
                        </p>
                    )}

                    {saved.termination_remarks && !editing && (
                        <div
                            className="mt-5 rounded-md bg-danger-50 px-3.5 py-3"
                            data-cy="academic-info-tab-div-32"
                        >
                            <div
                                className="text-xs font-medium text-danger-800"
                                data-cy="academic-info-tab-div-termination-remarks"
                            >
                                Termination remarks
                            </div>
                            <p
                                className="mt-1 text-xs leading-relaxed text-danger-800"
                                data-cy="academic-info-tab-p-34"
                            >
                                {saved.termination_remarks}
                            </p>
                        </div>
                    )}

                    <div
                        className="mt-5 border-t border-neutral-100 pt-4"
                        data-cy="academic-info-tab-div-35"
                    >
                        <div
                            className="mb-1.5 text-xs font-medium text-neutral-600"
                            data-cy="academic-info-tab-div-progress"
                        >
                            Progress
                        </div>
                        <div
                            className="h-2 w-full overflow-hidden rounded-pill bg-neutral-100"
                            data-cy="academic-info-tab-div-37"
                        >
                            <div
                                className="h-full rounded-pill bg-brand-500"
                                style={{
                                    width: `${hours.percent}%`,
                                }}
                                data-cy="academic-info-tab-div-38"
                            />
                        </div>
                        <div
                            className="mt-1.5 flex items-center gap-2 text-xs text-neutral-500"
                            data-cy="academic-info-tab-div-of"
                        >
                            {formatToTwoDecimals(hours.completed)} of{' '}
                            {formatToTwoDecimals(hours.required)} hrs completed
                            {hours.hoursComplete && (
                                <RequiredHoursCompletedPill />
                            )}
                        </div>
                    </div>
                </div>
            </TraineesDetailLayout>
        </>
    );
}
