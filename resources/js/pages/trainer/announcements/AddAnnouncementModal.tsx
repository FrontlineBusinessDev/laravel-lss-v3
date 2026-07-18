import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { TextAreaField, TextField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { trainerAnnouncementService } from '@/api-service-layer/trainer/announcements';
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

function emptyValues(): AnnouncementInput {
    return {
        subject: '',
        description: '',
        audience_batch_id: null,
        scheduled_at: '',
    };
}

export function AddAnnouncementModal({
    open,
    mode,
    announcement,
    onClose,
    onSubmit,
}: AddAnnouncementModalProps) {
    const [values, setValues] = useState<AnnouncementInput>(emptyValues());
    const [errors, setErrors] = useState<
        Partial<Record<'subject' | 'audience_batch_id', string>>
    >({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setValues(
                mode === 'edit' && announcement
                    ? {
                          subject: announcement.subject,
                          description: announcement.description ?? '',
                          audience_batch_id: announcement.audience_batch_id,
                          scheduled_at:
                              announcement.scheduled_at?.slice(0, 16) ?? '',
                      }
                    : emptyValues(),
            );
            setErrors({});
        }
    }, [open, mode, announcement]);

    function set<K extends keyof AnnouncementInput>(
        key: K,
        val: AnnouncementInput[K],
    ) {
        setValues((v) => ({ ...v, [key]: val }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    }

    function validate() {
        const next: typeof errors = {};
        if (!values.subject?.trim()) next.subject = 'Subject is required.';
        if (!values.audience_batch_id)
            next.audience_batch_id = 'Select a batch.';
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit() {
        if (!validate()) return;
        setSubmitting(true);
        try {
            await onSubmit(values);
        } finally {
            setSubmitting(false);
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
            <TextField
                label="Subject"
                placeholder="e.g. Reminder: Submit your requirements by Friday"
                value={values.subject ?? ''}
                onChange={(e) => set('subject', e.target.value)}
            />
            {errors.subject && (
                <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">
                    {errors.subject}
                </p>
            )}

            <TextAreaField
                label="Description"
                placeholder="Write the announcement details..."
                rows={4}
                value={values.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
            />

            <div className="mb-3.5">
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                    Batch
                </label>
                <AsyncSelectField
                    value={
                        values.audience_batch_id
                            ? String(values.audience_batch_id)
                            : ''
                    }
                    onChange={(v) =>
                        set('audience_batch_id', v ? Number(v) : null)
                    }
                    loadOptions={async () =>
                        (await trainerAnnouncementService.batchOptions()).map(
                            (o) => ({ value: String(o.value), label: o.label }),
                        )
                    }
                    placeholder="Select a batch"
                />
                {errors.audience_batch_id && (
                    <p className="mt-1.5 text-xs font-medium text-danger-600">
                        {errors.audience_batch_id}
                    </p>
                )}
            </div>

            <TextField
                label="Publish"
                type="datetime-local"
                optional
                value={values.scheduled_at ?? ''}
                onChange={(e) => set('scheduled_at', e.target.value)}
            />
            <p className="-mt-2.5 mb-3.5 text-xs text-neutral-400">
                Leave blank to publish immediately.
            </p>

            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onClose}
                    disabled={submitting}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {mode === 'edit' ? 'Save changes' : 'Post announcement'}
                </Button>
            </div>
        </Modal>
    );
}
