import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { trainerAnnouncementService } from '@/api-service-layer/trainer/announcements';
import { Button } from '@/components/Button';
import {
    errorInputCls,
    Field,
    inputCls,
    textareaCls,
} from '@/components/form/Field';
import { Modal } from '@/components/Modal';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { cn } from '@/lib/utils';
import type {
    AnnouncementInput,
    Announcements,
} from '@/types/modules/announcements/announcements';

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
    audience_batch_id: number | null;
    scheduled_at: string;
}

const EMPTY_VALUES: FormValues = {
    subject: '',
    description: '',
    audience_batch_id: null,
    scheduled_at: '',
};

// Mirrors Trainer\Announcements\AnnouncementsController::storeRules()/
// updateRules(): subject and audience_batch_id required (the batch itself is
// restricted server-side to this trainer's assigned batches via Rule::in()).
const announcementSchema = z.object({
    subject: z.string().trim().min(1, 'Subject is required.'),
    description: z.string(),
    audience_batch_id: z.number().nullable(),
    scheduled_at: z.string(),
}) satisfies z.ZodType<FormValues>;

const announcementFormSchema = announcementSchema.superRefine((values, ctx) => {
    if (!values.audience_batch_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['audience_batch_id'],
            message: 'Batch is required.',
        });
    }
});

function valuesFromAnnouncement(announcement: Announcements): FormValues {
    return {
        subject: announcement.subject,
        description: announcement.description ?? '',
        audience_batch_id: announcement.audience_batch_id,
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
        reset,
        handleSubmit: handleFormSubmit,
        formState: { errors, isSubmitting: submitting },
    } = useForm<FormValues>({
        resolver: zodResolver(announcementFormSchema),
        defaultValues: EMPTY_VALUES,
    });
    const [formError, setFormError] = useState<string | null>(null);

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
            description="Sent to trainees in the selected batch as an in-app notification and email."
            maxWidth={480}
        >
            <form onSubmit={handleFormSubmit(onValid)} className="space-y-0">
                <Field label="Subject" required error={errors.subject?.message}>
                    <input
                        placeholder="e.g. Reminder: Submit your requirements by Friday"
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

                <Field
                    label="Batch"
                    required
                    error={errors.audience_batch_id?.message}
                >
                    <Controller
                        control={control}
                        name="audience_batch_id"
                        render={({ field }) => (
                            <AsyncSelectField
                                value={field.value ? String(field.value) : ''}
                                onChange={(v) =>
                                    field.onChange(v ? Number(v as string) : null)
                                }
                                loadOptions={async () =>
                                    (
                                        await trainerAnnouncementService.batchOptions()
                                    ).map((o) => ({
                                        value: String(o.value),
                                        label: o.label,
                                    }))
                                }
                                placeholder="Select a batch"
                                error={errors.audience_batch_id?.message}
                            />
                        )}
                    />
                </Field>

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
