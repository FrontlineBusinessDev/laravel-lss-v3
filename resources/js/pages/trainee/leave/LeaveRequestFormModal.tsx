import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/api-service-layer/client';
import { leaveRequestService } from '@/api-service-layer/leave-request';
import { Button } from '@/components/Button';
import { errorInputCls, Field, inputCls, textareaCls } from '@/components/form/Field';
import { Modal } from '@/components/Modal';
import { emptyFileFieldValue, FileUploadField } from '@/hooks/use-file-upload-field';
import { cn } from '@/lib/utils';
import type { FieldOption, FileFieldValue } from '@/types/reusable/fields';

const REQUIRED_DOCUMENT_HELP_TEXT =
    'For School-Related Leave, uploading a supporting document is required. The supporting document must be signed or approved by the trainee’s school coordinator or authorized school representative.';

interface CategoryOption extends FieldOption {
    requiresDocument: boolean;
}

interface FormValues {
    leave_category_id: string;
    leave_date: string;
    return_date: string;
    reason: string;
}

const emptyValues: FormValues = {
    leave_category_id: '',
    leave_date: '',
    return_date: '',
    reason: '',
};

// Mirrors LeaveRequestController::store()'s validate() call: category/dates/
// reason required, return_date after_or_equal leave_date. `document`'s
// required_if(category.requires_document) rule isn't representable here
// since the file lives in separate FileUploadField state, not an RHF field —
// it's checked manually in onValid (see documentError below), same as before.
const leaveRequestSchema = z
    .object({
        leave_category_id: z.string().min(1, 'Category is required.'),
        leave_date: z.string().min(1, 'Leave date is required.'),
        return_date: z.string().min(1, 'Return date is required.'),
        reason: z.string().trim().min(1, 'Reason is required.'),
    })
    .superRefine((values, ctx) => {
        if (
            values.leave_date &&
            values.return_date &&
            values.return_date < values.leave_date
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['return_date'],
                message: 'Return date must be on or after the leave date.',
            });
        }
    });

interface Props {
    open: boolean;
    onClose: () => void;
    /** Called after a successful submit — invalidates the list + toasts. */
    onSubmitted: () => void;
}

export function LeaveRequestFormModal({ open, onClose, onSubmitted }: Props) {
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [document, setDocument] =
        useState<FileFieldValue>(emptyFileFieldValue);
    const [formError, setFormError] = useState<string | null>(null);
    const [documentError, setDocumentError] = useState<string | null>(null);
    const {
        control,
        register,
        handleSubmit: handleFormSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting: submitting },
    } = useForm<FormValues>({
        resolver: zodResolver(leaveRequestSchema),
        defaultValues: emptyValues,
    });

    useEffect(() => {
        leaveRequestService
            .leaveCategories()
            .then((rows) =>
                setCategories(
                    rows.map((c) => ({
                        value: String(c.id),
                        label: c.name,
                        requiresDocument: c.requires_document,
                    })),
                ),
            )
            .catch(() => setCategories([]));
    }, []);

    const leaveCategoryId = useWatch({ control, name: 'leave_category_id' });
    const selectedCategory = categories.find((c) => c.value === leaveCategoryId);
    const documentRequired = selectedCategory?.requiresDocument ?? false;

    async function onValid(submitValues: FormValues) {
        setFormError(null);
        setDocumentError(null);

        if (documentRequired && document.files.length === 0) {
            setDocumentError(
                'A supporting document is required for this leave type.',
            );

            return;
        }

        try {
            await leaveRequestService.submit({
                ...submitValues,
                document: document.files[0] ?? null,
            });
            reset(emptyValues);
            setDocument(emptyFileFieldValue);
            onSubmitted();
        } catch (err: unknown) {
            if (err instanceof ApiError && err.errors) {
                Object.entries(err.errors).forEach(([key, msgs]) => {
                    const message = Array.isArray(msgs) ? msgs[0] : String(msgs);

                    if (key === 'document') {
                        setDocumentError(message);

                        return;
                    }

                    if (key in emptyValues) {
                        setError(key as keyof FormValues, { message });
                    }
                });
            }

            setFormError(
                err instanceof Error ? err.message : 'Submission failed',
            );
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Submit a leave application"
            maxWidth={560}
        >
            <form onSubmit={handleFormSubmit(onValid)} className="space-y-0">
                <Field
                    label="Category"
                    required
                    error={errors.leave_category_id?.message}
                >
                    <select
                        className={cn(
                            inputCls,
                            errors.leave_category_id && errorInputCls,
                        )}
                        {...register('leave_category_id')}
                    >
                        <option value="">Select a category</option>
                        {categories.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </Field>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                    <Field
                        label="Leave date"
                        required
                        error={errors.leave_date?.message}
                    >
                        <input
                            type="date"
                            className={cn(inputCls, errors.leave_date && errorInputCls)}
                            {...register('leave_date')}
                        />
                    </Field>
                    <Field
                        label="Return date"
                        required
                        error={errors.return_date?.message}
                    >
                        <input
                            type="date"
                            className={cn(inputCls, errors.return_date && errorInputCls)}
                            {...register('return_date')}
                        />
                    </Field>
                </div>
                <Field label="Reason" required error={errors.reason?.message}>
                    <textarea
                        rows={3}
                        className={cn(textareaCls, errors.reason && errorInputCls)}
                        {...register('reason')}
                    />
                </Field>
                <Field
                    label="Supporting document"
                    required={documentRequired}
                    error={documentError ?? undefined}
                    helpText={
                        documentRequired ? REQUIRED_DOCUMENT_HELP_TEXT : undefined
                    }
                >
                    <FileUploadField
                        value={document}
                        onChange={(v) => {
                            setDocument(v);
                            setDocumentError(null);
                        }}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSizeMB={5}
                        error={documentError ?? undefined}
                    />
                </Field>

                {formError && (
                    <p className="text-danger-700 rounded-md bg-danger-50 px-3 py-2 text-xs">
                        {formError}
                    </p>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="mt-2"
                >
                    {submitting && <Loader2 className="size-4 animate-spin" />}
                    {submitting ? 'Submitting…' : 'Submit application'}
                </Button>
            </form>
        </Modal>
    );
}
