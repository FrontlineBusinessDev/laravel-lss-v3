import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import {
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/FormField';
import { Modal } from '@/components/Modal';
import type { AnnouncementInput, Announcements } from '@/types/modules/announcements/announcements';
import { AUDIENCE_OPTIONS } from '@/types/modules/announcements/announcements';

const STATUS_OPTIONS = ['active', 'inactive'];

interface AddAnnouncementModalProps {
    open: boolean;
    mode: 'create' | 'edit';
    announcement?: Announcements;
    onClose: () => void;
    onSubmit: (values: AnnouncementInput) => Promise<void>;
}

function emptyValues(): AnnouncementInput {
    return {
        status: 'active',
        subject: '',
        description: '',
        audience: AUDIENCE_OPTIONS[0],
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
        Partial<Record<'subject' | 'description', string>>
    >({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setValues(
                mode === 'edit' && announcement
                    ? {
                          status: announcement.status,
                          subject: announcement.subject,
                          description: announcement.description ?? '',
                          audience: announcement.audience,
                      }
                    : emptyValues(),
            );
            setErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            description="Notifications are sent automatically to the selected audience once posted."
            maxWidth={480}
        >
            <TextField
                label="Subject"
                placeholder="e.g. Reminder: Submit your MOA before Friday"
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

            <SelectField
                label="Audience"
                options={[...AUDIENCE_OPTIONS]}
                value={values.audience ?? AUDIENCE_OPTIONS[0]}
                onChange={(e) => set('audience', e.target.value)}
            />

            <SelectField
                label="Status"
                options={STATUS_OPTIONS}
                value={values.status ?? 'active'}
                onChange={(e) => set('status', e.target.value)}
            />

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
