import { useEffect, useState } from 'react';
import {
    traineePaymentsService
    
} from '@/api-service-layer/admin/trainee';
import type {TraineePaymentInput} from '@/api-service-layer/admin/trainee';
import { ApiError } from '@/api-service-layer/client';
import { Button } from '@/components/Button';
import { InfoNote, TextAreaField, TextField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import {
    emptyFileFieldValue,
    FileUploadField,
} from '@/hooks/use-file-upload-field';
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
    const [values, setValues] = useState<FormValues>(EMPTY);
    const [receipt, setReceipt] = useState<FileFieldValue>(emptyFileFieldValue);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) {
return;
}

        setValues(mode === 'edit' && payment ? valuesFromPayment(payment) : EMPTY);
        setReceipt(emptyFileFieldValue);
    }, [open, mode, payment]);

    function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
        setValues((v) => ({ ...v, [key]: val }));
    }

    const canSave = Number(values.amount_paid) > 0 && !!values.payment_date && !saving;

    async function handleSave() {
        if (!canSave) {
return;
}

        setSaving(true);

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
        } catch (error) {
            showToast(
                error instanceof ApiError ? error.message : 'Failed to save payment transaction.',
                'error',
            );
        } finally {
            setSaving(false);
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
            <div className="grid grid-cols-2 gap-3">
                <TextField
                    label="Payment date"
                    type="date"
                    value={values.payment_date}
                    onChange={(e) => set('payment_date', e.target.value)}
                />
                <TextField
                    label="Amount paid"
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.amount_paid}
                    onChange={(e) => set('amount_paid', e.target.value)}
                    placeholder="0.00"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <TextField
                    label="Reference no."
                    optional
                    value={values.reference_no}
                    onChange={(e) => set('reference_no', e.target.value)}
                    placeholder="e.g. REF-12345"
                />
                <TextField
                    label="Official receipt no."
                    optional
                    value={values.official_receipt_number}
                    onChange={(e) => set('official_receipt_number', e.target.value)}
                    placeholder="e.g. OR-00123"
                />
            </div>

            <TextField
                label="Reference link"
                optional
                type="url"
                value={values.receipt_link}
                onChange={(e) => set('receipt_link', e.target.value)}
                placeholder="e.g. a Google Drive/receipt link"
            />

            <div className="mb-3.5">
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

            <TextAreaField
                label="Notes"
                optional
                value={values.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Optional note for this transaction..."
            />

            {outstandingBalance !== undefined && traineeName && (
                <InfoNote>
                    Outstanding balance for {traineeName}:{' '}
                    <span className="font-medium text-neutral-700">
                        ₱{Math.max(0, outstandingBalance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    .
                </InfoNote>
            )}

            <div className="mt-1 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="primary" className="flex-1" disabled={!canSave} onClick={handleSave}>
                    {saving ? 'Saving…' : mode === 'add' ? 'Save payment' : 'Save changes'}
                </Button>
            </div>
        </Modal>
    );
}
