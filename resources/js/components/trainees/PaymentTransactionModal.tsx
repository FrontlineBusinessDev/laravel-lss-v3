import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    traineePaymentsService
} from '@/api-service-layer/admin/trainee';
import type {TraineePaymentInput} from '@/api-service-layer/admin/trainee';
import { ApiError } from '@/api-service-layer/client';
import { errorInputCls, Field, inputCls, textareaCls } from '@/components/form/Field';
import { InfoNote } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import {
    emptyFileFieldValue,
    FileUploadField,
} from '@/hooks/use-file-upload-field';
import { cn } from '@/lib/utils';
import type { AppTraineePayment } from '@/types/modules/trainees/trainee-detail';
import type { FileFieldValue } from '@/types/reusable/fields';

interface FormValues {
    payment_date: string;
    amount_paid: string;
    reference_no: string;
    official_receipt_number: string;
    receipt_link: string;
    notes: string;
}

const EMPTY: FormValues = {
    payment_date: new Date().toISOString().slice(0, 10),
    amount_paid: '',
    reference_no: '',
    official_receipt_number: '',
    receipt_link: '',
    notes: '',
};

// Mirrors TraineePaymentsController::storePayment()/updatePayment():
// amount_paid required numeric >= 0.01; payment_date required date;
// reference_no/official_receipt_number nullable max:100;
// receipt_link nullable max:2048; notes nullable max:1000. receipt itself
// (nullable file, mimes:pdf,jpg,jpeg,png, max:5120) isn't validated here —
// FileUploadField enforces its own accept/size constraints client-side.
const paymentTransactionSchema = z.object({
    payment_date: z.string().min(1, 'Payment date is required.'),
    amount_paid: z
        .string()
        .min(1, 'Amount paid is required.')
        .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0.01, 'Amount paid must be at least 0.01.'),
    reference_no: z.string().max(100, 'Reference no. must be 100 characters or fewer.'),
    official_receipt_number: z.string().max(100, 'Official receipt no. must be 100 characters or fewer.'),
    receipt_link: z.string().max(2048, 'Reference link must be 2048 characters or fewer.'),
    notes: z.string().max(1000, 'Notes must be 1000 characters or fewer.'),
}) satisfies z.ZodType<FormValues>;

function valuesFromPayment(payment: AppTraineePayment): FormValues {
    return {
        payment_date: payment.payment_date,
        amount_paid: payment.amount_paid,
        reference_no: payment.reference_no ?? '',
        official_receipt_number: payment.official_receipt_number ?? '',
        receipt_link: payment.receipt_link ?? '',
        notes: payment.notes ?? '',
    };
}

interface PaymentTransactionModalProps {
    open: boolean;
    mode: 'add' | 'edit';
    traineeId: number;
    traineeName?: string;
    outstandingBalance?: number;
    /** The record being edited — required for mode 'edit'. */
    payment?: AppTraineePayment | null;
    onClose: () => void;
    onSaved: () => void;
}

/**
 * The one "record/edit payment" modal for both the master Payments list page
 * and a trainee's own Payment Details tab — previously two separately
 * hand-rolled forms with different fields/order/labels. Both call sites hit
 * the same TraineePaymentsController endpoints, so the form itself is now
 * shared too.
 */
export function PaymentTransactionModal({
    open,
    mode,
    traineeId,
    traineeName,
    outstandingBalance,
    payment,
    onClose,
    onSaved,
}: PaymentTransactionModalProps) {
    const { showToast } = useToast();
    const {
        register,
        setError,
        handleSubmit: handleFormSubmit,
        reset,
        formState: { errors, isSubmitting: submitting },
    } = useForm<FormValues>({
        resolver: zodResolver(paymentTransactionSchema),
        defaultValues: EMPTY,
    });
    const [receipt, setReceipt] = useState<FileFieldValue>(emptyFileFieldValue);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        reset(mode === 'edit' && payment ? valuesFromPayment(payment) : EMPTY);
        setReceipt(emptyFileFieldValue);
        setFormError(null);
    }, [open, mode, payment, reset]);

    async function onValid(values: FormValues) {
        setFormError(null);

        try {
            const payload: TraineePaymentInput = {
                amount_paid: values.amount_paid,
                payment_date: values.payment_date,
                reference_no: values.reference_no || null,
                official_receipt_number: values.official_receipt_number || null,
                receipt_link: values.receipt_link || null,
                notes: values.notes || null,
                receipt: receipt.files[0] ?? null,
            };

            if (mode === 'add') {
                await traineePaymentsService.create(traineeId, payload);
            } else if (payment) {
                await traineePaymentsService.update(traineeId, payment.id, payload);
            }

            showToast(
                mode === 'add' ? 'Payment recorded successfully.' : 'Payment updated successfully.',
                'success',
            );
            onSaved();
            onClose();
        } catch (err: unknown) {
            if (err instanceof ApiError && err.errors) {
                Object.entries(err.errors).forEach(([key, msgs]) => {
                    if (key in EMPTY) {
                        setError(key as keyof FormValues, {
                            message: Array.isArray(msgs) ? msgs[0] : String(msgs),
                        });
                    }
                });
            }

            setFormError(
                err instanceof ApiError ? err.message : 'Failed to save payment transaction.',
            );
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === 'add' ? 'Record payment' : 'Edit payment'}
            description={
                traineeName
                    ? `${mode === 'add' ? 'Logging a new payment' : 'Editing transaction'} for ${traineeName}`
                    : undefined
            }
            maxWidth={480}
        >
            <form onSubmit={handleFormSubmit(onValid)} className="space-y-0">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                    <Field label="Payment date" error={errors.payment_date?.message}>
                        <input
                            type="date"
                            className={cn(inputCls, errors.payment_date && errorInputCls)}
                            {...register('payment_date')}
                        />
                    </Field>
                    <Field label="Amount paid" error={errors.amount_paid?.message}>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="0.00"
                            className={cn(inputCls, errors.amount_paid && errorInputCls)}
                            {...register('amount_paid')}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                    <Field label="Reference no." required={false} error={errors.reference_no?.message}>
                        <input
                            placeholder="e.g. REF-12345"
                            className={cn(inputCls, errors.reference_no && errorInputCls)}
                            {...register('reference_no')}
                        />
                    </Field>
                    <Field label="Official receipt no." required={false} error={errors.official_receipt_number?.message}>
                        <input
                            placeholder="e.g. OR-00123"
                            className={cn(inputCls, errors.official_receipt_number && errorInputCls)}
                            {...register('official_receipt_number')}
                        />
                    </Field>
                </div>

                <Field label="Reference link" required={false} error={errors.receipt_link?.message}>
                    <input
                        type="url"
                        placeholder="e.g. a Google Drive/receipt link"
                        className={cn(inputCls, errors.receipt_link && errorInputCls)}
                        {...register('receipt_link')}
                    />
                </Field>

                <div className="mb-3">
                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                        Official receipt document (optional)
                    </label>
                    <FileUploadField
                        value={receipt}
                        onChange={setReceipt}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSizeMB={5}
                    />
                </div>

                <Field label="Notes" required={false} error={errors.notes?.message}>
                    <textarea
                        placeholder="Optional note for this transaction..."
                        rows={3}
                        className={cn(textareaCls, errors.notes && errorInputCls)}
                        {...register('notes')}
                    />
                </Field>

                {outstandingBalance !== undefined && traineeName && (
                    <InfoNote>
                        Outstanding balance for {traineeName}:{' '}
                        <span className="font-medium text-neutral-700">
                            ₱{Math.max(0, outstandingBalance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                        .
                    </InfoNote>
                )}

                {formError && (
                    <p className="text-danger-700 rounded-md bg-danger-50 px-3 py-2 text-xs">
                        {formError}
                    </p>
                )}

                <div className="mt-1 flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
                    >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {mode === 'add' ? 'Save payment' : 'Save changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
