import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/Button';
import {
    errorInputCls,
    Field,
    inputCls,
    textareaCls,
} from '@/components/form/Field';
import { Modal } from '@/components/Modal';
import { AsyncMultiSelectField } from '@/hooks/use-async-multi-select-field';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { cn } from '@/lib/utils';
import type {
    AnnouncementInput,
    Announcements,
} from '@/types/modules/announcements/announcements';
import {
    AUDIENCE_ROLE_OPTIONS,
    AUDIENCE_TYPE_OPTIONS,
    loadTraineeOptions,
} from '@/types/modules/announcements/announcements';
import { loadLookupOptions } from '@/types/reusable/fields';

interface AddAnnouncementModalProps {
    open: boolean;
    mode: 'create' | 'edit';
    announcement?: Announcements;
    onClose: () => void;
    onSubmit: (values: AnnouncementInput) => Promise<void>;
}

interface FormValues {
    subject: string;
    description: string;
    audience_type: 'all' | 'batch' | 'role' | 'custom';
    audience: 'trainee' | 'trainer' | null;
    audience_batch_id: number | null;
    audience_user_ids: number[];
    scheduled_at: string;
}

const EMPTY_VALUES: FormValues = {
    subject: '',
    description: '',
    audience_type: 'all',
    audience: null,
    audience_batch_id: null,
    audience_user_ids: [],
    scheduled_at: '',
};

// AUDIENCE_TYPE_OPTIONS' leading blank entry ("All Audiences") is a list-filter
// reset affordance, not a valid audience_type to save — excluded here.
const AUDIENCE_TYPE_CHOICES = AUDIENCE_TYPE_OPTIONS.filter((o) => o.value !== '');

// Mirrors AnnoucementController::storeRules()/updateRules(): subject required;
// audience_batch_id/audience/audience_user_ids are each required only when
// audience_type selects that branch (required_if).
const announcementSchema = z.object({
    subject: z.string().trim().min(1, 'Subject is required.'),
    description: z.string(),
    audience_type: z.enum(['all', 'batch', 'role', 'custom']),
    audience: z.enum(['trainee', 'trainer']).nullable(),
    audience_batch_id: z.number().nullable(),
    audience_user_ids: z.array(z.number()),
    scheduled_at: z.string(),
}) satisfies z.ZodType<FormValues>;

const announcementFormSchema = announcementSchema.superRefine((values, ctx) => {
    if (values.audience_type === 'batch' && !values.audience_batch_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['audience_batch_id'],
            message: 'Batch is required.',
        });
    }

    if (values.audience_type === 'role' && !values.audience) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['audience'],
            message: 'Role is required.',
        });
    }

    if (values.audience_type === 'custom' && values.audience_user_ids.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['audience_user_ids'],
            message: 'Select at least one trainee.',
        });
    }
});

function valuesFromAnnouncement(announcement: Announcements): FormValues {
    return {
        subject: announcement.subject,
        description: announcement.description ?? '',
        audience_type: announcement.audience_type,
        audience: (announcement.audience as FormValues['audience']) ?? null,
        audience_batch_id: announcement.audience_batch_id,
        audience_user_ids: announcement.audience_user_ids ?? [],
        scheduled_at: announcement.scheduled_at?.slice(0, 16) ?? '',
    };
}

export function AddAnnouncementModal({
    open,
    mode,
    announcement,
    onClose,
    onSubmit,
}: AddAnnouncementModalProps) {
    const {
        control,
        register,
        watch,
        reset,
        handleSubmit: handleFormSubmit,
        formState: { errors, isSubmitting: submitting },
    } = useForm<FormValues>({
        resolver: zodResolver(announcementFormSchema),
        defaultValues: EMPTY_VALUES,
    });
    const [formError, setFormError] = useState<string | null>(null);
    const audienceType = watch('audience_type');

    useEffect(() => {
        if (!open) {
            return;
        }

        reset(
            mode === 'edit' && announcement
                ? valuesFromAnnouncement(announcement)
                : EMPTY_VALUES,
        );
    }, [open, mode, announcement, reset]);

    async function onValid(values: FormValues) {
        setFormError(null);

        try {
            await onSubmit(values);
            onClose();
        } catch (err: unknown) {
            setFormError(
                err instanceof Error ? err.message : 'Failed to save announcement.',
            );
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === 'edit' ? 'Edit announcement' : 'New announcement'}
            description="Notifications are sent automatically to the selected audience once posted."
            maxWidth={480}
        >
            <form onSubmit={handleFormSubmit(onValid)} className="space-y-0">
                <Field label="Subject" required error={errors.subject?.message}>
                    <input
                        placeholder="e.g. Reminder: Submit your MOA before Friday"
                        className={cn(inputCls, errors.subject && errorInputCls)}
                        {...register('subject')}
                    />
                </Field>

                <Field label="Description" error={errors.description?.message}>
                    <textarea
                        placeholder="Write the announcement details..."
                        rows={4}
                        className={cn(textareaCls, errors.description && errorInputCls)}
                        {...register('description')}
                    />
                </Field>

                <Field label="Audience" error={errors.audience_type?.message}>
                    <Controller
                        control={control}
                        name="audience_type"
                        render={({ field }) => (
                            <select
                                className={cn(inputCls, errors.audience_type && errorInputCls)}
                                value={field.value}
                                onChange={field.onChange}
                            >
                                {AUDIENCE_TYPE_CHOICES.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    />
                </Field>

                {audienceType === 'batch' && (
                    <Field label="Batch" error={errors.audience_batch_id?.message}>
                        <Controller
                            control={control}
                            name="audience_batch_id"
                            render={({ field }) => (
                                <AsyncSelectField
                                    value={field.value ? String(field.value) : ''}
                                    onChange={(v) =>
                                        field.onChange(v ? Number(v as string) : null)
                                    }
                                    loadOptions={(q) =>
                                        loadLookupOptions('/batches', q, 'batch_code')
                                    }
                                    placeholder="Select a batch"
                                    error={errors.audience_batch_id?.message}
                                />
                            )}
                        />
                    </Field>
                )}

                {audienceType === 'role' && (
                    <Field label="Role" error={errors.audience?.message}>
                        <Controller
                            control={control}
                            name="audience"
                            render={({ field }) => (
                                <select
                                    className={cn(inputCls, errors.audience && errorInputCls)}
                                    value={field.value ?? ''}
                                    onChange={(e) =>
                                        field.onChange(e.target.value as FormValues['audience'])
                                    }
                                >
                                    {AUDIENCE_ROLE_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                    </Field>
                )}

                {audienceType === 'custom' && (
                    <Field label="Trainees" error={errors.audience_user_ids?.message}>
                        <Controller
                            control={control}
                            name="audience_user_ids"
                            render={({ field }) => (
                                <AsyncMultiSelectField
                                    value={field.value.map(String)}
                                    onChange={(v) => field.onChange(v.map(Number))}
                                    loadOptions={loadTraineeOptions}
                                    placeholder="Select trainee(s)"
                                    error={errors.audience_user_ids?.message}
                                />
                            )}
                        />
                    </Field>
                )}

                <Field
                    label="Publish"
                    error={errors.scheduled_at?.message}
                    helpText="Leave blank to publish immediately."
                >
                    <input
                        type="datetime-local"
                        className={cn(inputCls, errors.scheduled_at && errorInputCls)}
                        {...register('scheduled_at')}
                    />
                </Field>

                {formError && (
                    <p className="text-danger-700 rounded-md bg-danger-50 px-3 py-2 text-xs">
                        {formError}
                    </p>
                )}

                <div className="flex gap-2 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={submitting}
                    >
                        {submitting && (
                            <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" />
                        )}
                        {mode === 'edit' ? 'Save changes' : 'Post announcement'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
