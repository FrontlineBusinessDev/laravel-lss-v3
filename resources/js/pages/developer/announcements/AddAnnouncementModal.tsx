import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import {
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { AsyncMultiSelectField } from '@/hooks/use-async-multi-select-field';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import type {
    AnnouncementInput,
    Announcements,
} from '@/types/modules/announcements/announcements';
import {
    AUDIENCE_ROLE_OPTIONS,
    AUDIENCE_TYPE_OPTIONS,
} from '@/types/modules/announcements/announcements';
import { loadLookupOptions, type FieldOption } from '@/types/reusable/fields';

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
        audience_type: 'all',
        audience: null,
        audience_batch_id: null,
        audience_user_ids: [],
        scheduled_at: '',
    };
}

async function loadTraineeOptions(query: string): Promise<FieldOption[]> {
    const res = await apiFetchJson<{
        data: { id: number; first_name: string; last_name: string }[];
    }>(
        `/trainees/pagination-search?filters[status]=active&per_page=50&search=${encodeURIComponent(query)}`,
    );
    return (res.data?.data ?? []).map((p) => ({
        value: String(p.id),
        label: `${p.first_name} ${p.last_name}`,
    }));
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
                          subject: announcement.subject,
                          description: announcement.description ?? '',
                          audience_type: announcement.audience_type,
                          audience: announcement.audience,
                          audience_batch_id: announcement.audience_batch_id,
                          audience_user_ids:
                              announcement.audience_user_ids ?? [],
                          scheduled_at:
                              announcement.scheduled_at?.slice(0, 16) ?? '',
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
                options={AUDIENCE_TYPE_OPTIONS.map((o) => o.label)}
                value={
                    AUDIENCE_TYPE_OPTIONS.find(
                        (o) => o.value === values.audience_type,
                    )?.label ?? AUDIENCE_TYPE_OPTIONS[0].label
                }
                onChange={(e) => {
                    const match = AUDIENCE_TYPE_OPTIONS.find(
                        (o) => o.label === e.target.value,
                    );
                    set(
                        'audience_type',
                        (match?.value ??
                            'all') as AnnouncementInput['audience_type'],
                    );
                }}
            />

            {values.audience_type === 'batch' && (
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
                            set(
                                'audience_batch_id',
                                v ? Number(v) : null,
                            )
                        }
                        loadOptions={(q) =>
                            loadLookupOptions('/batches', q, 'batch_code')
                        }
                        placeholder="Select a batch"
                    />
                </div>
            )}

            {values.audience_type === 'role' && (
                <SelectField
                    label="Role"
                    options={AUDIENCE_ROLE_OPTIONS.map((o) => o.label)}
                    value={
                        AUDIENCE_ROLE_OPTIONS.find(
                            (o) => o.value === values.audience,
                        )?.label ?? AUDIENCE_ROLE_OPTIONS[0].label
                    }
                    onChange={(e) => {
                        const match = AUDIENCE_ROLE_OPTIONS.find(
                            (o) => o.label === e.target.value,
                        );
                        set('audience', match?.value ?? 'trainee');
                    }}
                />
            )}

            {values.audience_type === 'custom' && (
                <div className="mb-3.5">
                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                        Trainees
                    </label>
                    <AsyncMultiSelectField
                        value={(values.audience_user_ids ?? []).map(String)}
                        onChange={(v) =>
                            set(
                                'audience_user_ids',
                                v.map((id) => Number(id)),
                            )
                        }
                        loadOptions={loadTraineeOptions}
                        placeholder="Select trainee(s)"
                    />
                </div>
            )}

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
