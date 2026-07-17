import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, TextAreaField, InfoNote } from '@/components/FormField';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { formatCurrency } from './paymentsUtils';
import { traineeFullName, type AppPaymentDetail } from './types';

interface TransactionFormValues {
  payment_date: string;
  amount_paid: string;
  reference_no: string;
  notes: string;
}

const EMPTY: TransactionFormValues = {
  payment_date: new Date().toISOString().slice(0, 10),
  amount_paid: '',
  reference_no: '',
  notes: '',
};

interface TransactionModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  traineeId: number | null;
  paymentId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export function TransactionModal({ open, mode, traineeId, paymentId, onClose, onSaved }: TransactionModalProps) {
  const { showToast } = useToast();
  const [values, setValues] = useState<TransactionFormValues>(EMPTY);
  const [trainee, setTrainee] = useState<AppPaymentDetail | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || traineeId == null) return;
    apiFetchJson<AppPaymentDetail>(`/payments/${traineeId}`).then((res) => {
      setTrainee(res.data);
      if (mode === 'edit' && paymentId != null) {
        const existing = res.data.payments.find((p) => p.id === paymentId);
        if (existing) {
          setValues({
            payment_date: existing.payment_date,
            amount_paid: existing.amount_paid,
            reference_no: existing.reference_no ?? '',
            notes: existing.notes ?? '',
          });
          return;
        }
      }
      setValues(EMPTY);
    });
  }, [open, mode, traineeId, paymentId]);

  function set<K extends keyof TransactionFormValues>(key: K, val: TransactionFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  const amountValid = Number(values.amount_paid) > 0;
  const canSave = amountValid && !!values.payment_date && !saving;

  async function handleSave() {
    if (traineeId == null || !canSave) return;
    setSaving(true);
    try {
      const payload = {
        amount_paid: values.amount_paid,
        payment_date: values.payment_date,
        reference_no: values.reference_no || null,
        notes: values.notes || null,
      };
      if (mode === 'add') {
        await apiFetchJson(`/trainees/${traineeId}/payments`, { method: 'POST', body: JSON.stringify(payload) });
      } else if (paymentId != null) {
        await apiFetchJson(`/trainees/${traineeId}/payments/${paymentId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      }
      showToast(mode === 'add' ? 'Payment transaction recorded.' : 'Payment transaction updated.', 'success');
      onSaved();
      onClose();
    } catch {
      showToast('Failed to save payment transaction.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'add' ? 'Record payment transaction' : 'Edit payment transaction'}
      description={trainee ? `${mode === 'add' ? 'Logging a new payment' : 'Editing transaction'} for ${traineeFullName(trainee)}` : undefined}
      maxWidth={480}
      data-cy="transaction-modal-modal-close"
    >
      <div className="grid grid-cols-2 gap-3" data-cy="transaction-modal-div-2">
        <TextField label="Transaction date" type="date" value={values.payment_date} onChange={(e) => set('payment_date', e.target.value)} data-cy="transaction-modal-text-field-transaction-date" />
        <TextField label="Amount paid" type="number" min={0} step="0.01" value={values.amount_paid} onChange={(e) => set('amount_paid', e.target.value)} placeholder="0.00" data-cy="transaction-modal-text-field-amount-paid" />
      </div>

      <TextField label="Reference no." optional value={values.reference_no} onChange={(e) => set('reference_no', e.target.value)} placeholder="e.g. REF-12345 / OR-2026-0201" data-cy="transaction-modal-text-field-reference-no" />

      <TextAreaField label="Notes" optional value={values.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional note for this transaction..." data-cy="transaction-modal-text-area-field-notes" />

      {trainee && (
        <InfoNote data-cy="transaction-modal-info-note-12">
          Outstanding balance for {traineeFullName(trainee)}: <span className="font-medium text-neutral-700">{formatCurrency(Math.max(0, Number(trainee.outstanding_balance)))}</span>.
        </InfoNote>
      )}

      <div className="mt-1 flex gap-2" data-cy="transaction-modal-div-14">
        <Button variant="secondary" className="flex-1" onClick={onClose} data-cy="transaction-modal-button-close">
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" disabled={!canSave} onClick={handleSave} data-cy="transaction-modal-button-save">
          {mode === 'add' ? 'Save transaction' : 'Save changes'}
        </Button>
      </div>
    </Modal>
  );
}
