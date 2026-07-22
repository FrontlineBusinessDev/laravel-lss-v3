import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, TextAreaField, SelectField } from '@/components/FormField';
import { useToast } from '@/components/Toast';
import type { Seminar } from '@/types';
import { AppSeminar } from '@/types/modules/seminar/seminar';
import { apiFetchJson } from '@/lib/apiFetch';
import { Loader2 } from 'lucide-react';

export interface SeminarDraft {
    topic: string;
    description: string;
    date: string;
    venue: string;
    fee: string;
    registered_count: number;
    registration_link: string;
    max_participants: string;
}
const EMPTY_DRAFT: SeminarDraft = {
    topic: '',
    description: '',
    date: '',
    venue: '',
    fee: '',
    registered_count: 0,
    registration_link: '',
    max_participants: '',
};
interface Props {
    open: boolean;
    onClose: () => void;
    editing?: Seminar | null;
    row: Seminar | null;
    onSubmit?: (values: Record<string, unknown>) => Promise<void>;
    onSaved?: (saved: AppSeminar) => void;
    mode?: 'create' | 'edit';
}

export function CreateEditSeminarModal({
    open,
    onClose,
    onSubmit,
    onSaved,
    mode: modeProp,
    editing,
    row,
}: Props) {
    const { showToast } = useToast();
    const [draft, setDraft] = useState<SeminarDraft>(EMPTY_DRAFT);
    const [touched, setTouched] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const isEdit = (modeProp ?? (row ? 'edit' : 'create')) === 'edit';

    useEffect(() => {
        if (!open) return;
        setTouched(false);
        if (editing) {
            setDraft({
                topic: editing.topic,
                description: editing.description,
                date: editing.date,
                venue: editing.venue,
                fee: String(editing.fee ?? ''),
                registered_count: editing.registered_count,
                registration_link: editing.registration_link,
                max_participants: editing.max_participants
                    ? String(editing.max_participants)
                    : '',
            });
        } else {
            setDraft(EMPTY_DRAFT);
        }
    }, [open, editing]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [values, setValues] = useState<Seminar>(() => ({
        id: row?.id ?? '',
        topic: row?.topic ?? '',
        description: row?.description ?? '',
        date: row?.date ? String(row.date).slice(0, 10) : '',
        venue: row?.venue ?? '',
        fee: row?.fee ?? 0, // Fallback to number 0
        max_participants: row?.max_participants ?? undefined, // Optional field
        status: row?.status ?? 'active',
        registered_count: row?.registered_count ?? 0, // Fallback to number 0
        type: row?.type ?? '',
        registration_link: row?.registration_link ?? '',
        is_public_url_enable: row?.is_public_url_enable ?? false,
    }));

    const set = <K extends keyof Seminar>(key: K, value: Seminar[K]) => {
        setValues((prev) => ({
            ...prev,
            [key]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [key]: '',
        }));
    };

    const persist = async () => {
        // DataTableField owns persistence + toast + list refresh + close.
        if (onSubmit) {
            await onSubmit({
                ...values,
            });
            return;
        }
        const url = row
            ? `/seminars/list-of-seminars/${row.id}`
            : '/seminars/list-of-seminars';
        const response = await apiFetchJson<AppSeminar>(url, {
            method: row ? 'PUT' : 'POST',
            body: JSON.stringify(values),
        });
        showToast(row ? 'seminar updated' : 'seminar created', 'success');
        onSaved?.(response.data);
        onClose();
    };
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        // if (!validate()) {
        //     return;
        // }
        setSubmitting(true);
        try {
            await persist();
        } catch (err: unknown) {
            const error =
                err instanceof Error
                    ? err
                    : new Error('Failed to save seminar.');
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
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editing ? 'Edit seminar' : 'Add seminar'}
            maxWidth={460}
            data-cy="create-edit-seminar-modal-modal-close"
        >
            {' '}
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
                data-cy="create-seminar-modal-form-submit"
            >
                <TextField
                    label="Seminar topic"
                    placeholder="e.g. AI Automation for HR"
                    value={draft.topic}
                    onChange={(e) =>
                        setDraft((d) => ({
                            ...d,
                            topic: e.target.value,
                        }))
                    }
                    className={
                        touched && !draft.topic.trim()
                            ? 'border-danger-300!'
                            : ''
                    }
                    data-cy="create-edit-seminar-modal-text-field-seminar-topic"
                />
                <TextAreaField
                    label="Description"
                    placeholder="Seminar description"
                    value={draft.description}
                    onChange={(e) =>
                        setDraft((d) => ({
                            ...d,
                            description: e.target.value,
                        }))
                    }
                    data-cy="create-edit-seminar-modal-text-area-field-description"
                />
                <div
                    className="grid grid-cols-2 gap-3"
                    data-cy="create-edit-seminar-modal-div-5"
                >
                    <TextField
                        label="Date"
                        type="date"
                        value={draft.date}
                        onChange={(e) =>
                            setDraft((d) => ({
                                ...d,
                                date: e.target.value,
                            }))
                        }
                        data-cy="create-edit-seminar-modal-text-field-date"
                    />
                    <TextField
                        label="Registration fee (PHP)"
                        type="number"
                        placeholder="0"
                        value={draft.fee}
                        onChange={(e) =>
                            setDraft((d) => ({
                                ...d,
                                fee: e.target.value,
                            }))
                        }
                        data-cy="create-edit-seminar-modal-text-field-0"
                    />
                </div>
                <TextField
                    label="Venue / Platform"
                    placeholder="Online or physical location"
                    value={draft.venue}
                    onChange={(e) =>
                        setDraft((d) => ({
                            ...d,
                            venue: e.target.value,
                        }))
                    }
                    data-cy="create-edit-seminar-modal-text-field-venue-platform"
                />
                <TextField
                    label="Maximum participants"
                    type="number"
                    placeholder="Leave blank for unlimited"
                    optional
                    value={draft.max_participants}
                    onChange={(e) =>
                        setDraft((d) => ({
                            ...d,
                            max_participants: e.target.value,
                        }))
                    }
                    data-cy="create-edit-seminar-modal-text-field-maximum-participants"
                />

                <label
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-neutral-200 px-3 py-2.5"
                    data-cy="create-seminar-modal-label-12"
                >
                    <input
                        type="checkbox"
                        // checked={draft.is_public_url_enable}
                        onChange={(e) =>
                            set('is_public_url_enable', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-100"
                        data-cy="create-seminar-modal-input-checkbox"
                    />
                    <span
                        className="text-sm font-medium text-neutral-700"
                        data-cy="create-seminar-modal-span-enable-public-registration-url"
                    >
                        Enable public registration URL
                    </span>
                </label>
                <div
                    className="flex items-center justify-end gap-2 pt-2"
                    data-cy="create-seminar-modal-div-16"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                        data-cy="create-seminar-modal-button-button"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
                        data-cy="create-seminar-modal-button-submit"
                    >
                        {submitting && (
                            <Loader2
                                className="h-4 w-4 animate-spin"
                                data-cy="create-seminar-modal-loader2-19"
                            />
                        )}
                        {isEdit ? 'Save changes' : 'Create seminar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
