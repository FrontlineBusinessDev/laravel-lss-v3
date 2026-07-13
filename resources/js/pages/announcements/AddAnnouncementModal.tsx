import { Button } from '@/components/Button';
import {
    InfoNote,
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { MultiSelectDropdown } from '@/components/MultiSelectDropdown';
import { useToast } from '@/hooks/use-toast';
import { apiFetchJson } from '@/lib/apiFetch';
import type { AnnouncementAudience, Trainee } from '@/types';
import { Announcements } from '@/types/modules/announcements/announcements';
import { Info } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const AUDIENCE_OPTIONS: AnnouncementAudience[] = [
    'All trainees',
    'Specific batch',
    'Trainees with incomplete documents',
    'Custom group',
];

export interface AnnouncementFormValues {
    subject: string;
    description: string;
    audience: string;
    status: string;
}

interface AddAnnouncementModalProps {
    open?: boolean;
    mode: 'create' | 'edit';
    onClose: () => void;
    onSave?: (values: AnnouncementFormValues) => void;
    onSubmit?: (values: Record<string, unknown>) => Promise<void>;
    batchOptions?: string[];
    traineeOptions?: string[];
    trainees?: Trainee[];
    announcementData?: Announcements[] | null;
    /** Given the current form state, resolve how many trainees will actually receive this announcement. */
    resolveRecipientCount?: (
        values: Pick<
            AnnouncementFormValues,
            'description' | 'status' | 'groupTraineeNames'
        >,
        trainees: Trainee[],
    ) => number;
}

function emptyValues(batchOptions: string[]): AnnouncementFormValues {
    return {
        subject: '',
        description: '',
        audience: 'all trainees',
        status: 'active',
        // batchNo: batchOptions[0] ?? '',
        // groupTraineeNames: [],
    };
}

export function AddAnnouncementModal({
    open,
    mode: modeProp,
    onClose,
    onSave,
    onSubmit,
    batchOptions = [],
    traineeOptions = [],
    trainees = [],
    announcementData = null,
    resolveRecipientCount = (a, b) => 0,
}: AddAnnouncementModalProps) {
    const { toast } = useToast();
    const [values, setValues] = useState<AnnouncementFormValues>(() =>
        emptyValues(batchOptions),
    );
    const [errors, setErrors] = useState<
        Partial<
            Record<
                'subject' | 'description' | 'batchNo' | 'groupTraineeNames',
                string
            >
        >
    >({});
    const [submitting, setSubmitting] = useState(false);
    const isEdit = modeProp === 'edit' ? true : false;
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setValues(emptyValues(batchOptions));
            setErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function set<K extends keyof AnnouncementFormValues>(
        key: K,
        val: AnnouncementFormValues[K],
    ) {
        setValues((v) => ({ ...v, [key]: val }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    }

    const recipientCount = useMemo(
        () => resolveRecipientCount(values, trainees),
        [values, trainees, resolveRecipientCount],
    );

    const persist = async () => {
        // DataTableField owns persistence + toast + list refresh + close.
        if (onSubmit) {
            await onSubmit({ ...values });
            return;
        }

        const url =
            isEdit && announcementData
                ? `/announcement/${announcementData.id}`
                : '/announcement';
        const response = await apiFetchJson<Announcements>(url, {
            method: announcementData ? 'PUT' : 'POST',
            body: JSON.stringify(values),
        });

        toast({
            subject: announcementData
                ? 'Announcement updated'
                : 'Announcement created',
            variant: 'success',
        });
        onSave?.(response.data);
        onClose();
    };

    function validate() {
        const next: typeof errors = {};
        if (!values.subject.trim()) next.subject = 'Subject is required.';
        if (!values.description.trim())
            next.description = 'Description is required.';
        if (values.audience === 'Specific batch' && !values.batchNo)
            next.batchNo = 'Select a batch.';
        // if (
        //     values.audience === 'Custom group' &&
        //     values.groupTraineeNames.length === 0
        // )
        //     next.groupTraineeNames = 'Select at least one trainee.';
        // setErrors(next);
        return Object.keys(next).length === 0;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!validate()) return;
        setSubmitting(true);
        try {
            await persist();
        } catch (err: unknown) {
            const error =
                err instanceof Error ? err : new Error('Failed to save batch.');
            const apiErrors = (
                error as Error & { errors?: Record<string, string[]> }
            ).errors;

            if (apiErrors) {
                const mapped: Record<string, string> = {};
                Object.entries(apiErrors).forEach(([key, msgs]) => {
                    mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
                });
                setErrors((prev) => ({ ...prev, ...mapped }));
            }

            setFormError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New announcement"
            description="Notifications are sent automatically to the selected audience via email once posted."
            maxWidth={480}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                    label="Subject"
                    placeholder="e.g. Reminder: Submit your MOA before Friday"
                    value={values.subject}
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
                    value={values.description}
                    onChange={(e) => set('description', e.target.value)}
                />
                {errors.description && (
                    <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">
                        {errors.description}
                    </p>
                )}

                <SelectField
                    label="Audience"
                    options={AUDIENCE_OPTIONS}
                    value={values.audience}
                    onChange={(e) =>
                        set('audience', e.target.value as AnnouncementAudience)
                    }
                />

                {/* {values.audience === 'Specific batch' && (
                    <>
                        <SelectField
                            label="Batch"
                            options={batchOptions}
                            value={values.batchNo}
                            onChange={(e) => set('batchNo', e.target.value)}
                        />
                        {errors.batchNo && (
                            <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">
                                {errors.batchNo}
                            </p>
                        )}
                    </>
                )} */}

                {/* {values.audience === 'Custom group' && (
                    <div className="mb-3.5">
                        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                            Recipients
                        </label>
                        <MultiSelectDropdown
                            options={traineeOptions}
                            value={values.groupTraineeNames}
                            placeholder="Select trainees"
                            onChange={(v) => set('groupTraineeNames', v)}
                        />
                        {errors.groupTraineeNames && (
                            <p className="mt-1.5 text-xs font-medium text-danger-600">
                                {errors.groupTraineeNames}
                            </p>
                        )}
                    </div>
                )} */}

                <InfoNote>
                    <Info
                        size={14}
                        className="mt-0.5 shrink-0 text-neutral-400"
                    />
                    {recipientCount > 0
                        ? `This will notify ${recipientCount} trainee${recipientCount === 1 ? '' : 's'} by email once posted.`
                        : 'No trainees match this audience yet \u2014 refine your selection before posting.'}
                </InfoNote>

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
                        Post announcement
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
