import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, InfoNote } from '@/components/FormField';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { traineeFullName, type AppPaymentDetail } from './types';

interface BillingOverrideFormValues {
  override_rate_per_hour: string;
  override_hours_discount_percent: string;
  override_group_discount_percent: string;
}

const EMPTY: BillingOverrideFormValues = {
  override_rate_per_hour: '',
  override_hours_discount_percent: '',
  override_group_discount_percent: '',
};

interface EditPaymentInfoModalProps {
  open: boolean;
  traineeId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditPaymentInfoModal({ open, traineeId, onClose, onSaved }: EditPaymentInfoModalProps) {
  const { showToast } = useToast();
  const [trainee, setTrainee] = useState<AppPaymentDetail | null>(null);
  const [values, setValues] = useState<BillingOverrideFormValues>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || traineeId == null) return;
    apiFetchJson<AppPaymentDetail>(`/payments/${traineeId}`).then((res) => {
      setTrainee(res.data);
      setValues({
        override_rate_per_hour: res.data.override_rate_per_hour ?? '',
        override_hours_discount_percent: res.data.override_hours_discount_percent ?? '',
        override_group_discount_percent: res.data.override_group_discount_percent ?? '',
      });
    });
  }, [open, traineeId]);

  function set<K extends keyof BillingOverrideFormValues>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  const hoursDiscount = values.override_hours_discount_percent === '' ? null : Number(values.override_hours_discount_percent);
  const groupDiscount = values.override_group_discount_percent === '' ? null : Number(values.override_group_discount_percent);
  const canSave =
    (hoursDiscount == null || (hoursDiscount >= 0 && hoursDiscount <= 100)) &&
    (groupDiscount == null || (groupDiscount >= 0 && groupDiscount <= 100)) &&
    !saving;

  async function handleSave() {
    if (traineeId == null || !canSave) return;
    setSaving(true);
    try {
      await apiFetchJson(`/trainees/${traineeId}/billing-overrides`, {
        method: 'PATCH',
        body: JSON.stringify({
          override_rate_per_hour: values.override_rate_per_hour || null,
          override_hours_discount_percent: values.override_hours_discount_percent || null,
          override_group_discount_percent: values.override_group_discount_percent || null,
        }),
      });
      showToast('Payment information updated.', 'success');
      onSaved();
      onClose();
    } catch {
      showToast('Failed to update payment information.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!trainee) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit payment information"
      description={`Override ${traineeFullName(trainee)}'s billing rate or discount percentages. Leave a field blank to fall back to the batch/school default.`}
      maxWidth={440}
      data-cy="edit-payment-info-modal-modal-edit-payment-information"
    >
      <InfoNote data-cy="edit-payment-info-modal-info-note-2">
        Default (from batch/school): rate {trainee.applied_rate_per_hour}/hr, {trainee.hours_discount_percent}% hours discount, {trainee.group_discount_percent}% group
        discount. Setting an override here recalculates the net amount due.
      </InfoNote>

      <TextField
        label="Override rate per hour"
        optional
        type="number"
        min={0}
        step="0.01"
        value={values.override_rate_per_hour}
        onChange={(e) => set('override_rate_per_hour', e.target.value)}
        data-cy="edit-payment-info-modal-text-field-override-rate"
      />
      <TextField
        label="Override hours discount %"
        optional
        type="number"
        min={0}
        max={100}
        step="0.01"
        value={values.override_hours_discount_percent}
        onChange={(e) => set('override_hours_discount_percent', e.target.value)}
        data-cy="edit-payment-info-modal-text-field-override-hours-discount"
      />
      <TextField
        label="Override group discount %"
        optional
        type="number"
        min={0}
        max={100}
        step="0.01"
        value={values.override_group_discount_percent}
        onChange={(e) => set('override_group_discount_percent', e.target.value)}
        data-cy="edit-payment-info-modal-text-field-override-group-discount"
      />

      <div className="flex gap-2" data-cy="edit-payment-info-modal-div-12">
        <Button variant="secondary" className="flex-1" onClick={onClose} data-cy="edit-payment-info-modal-button-close">
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" disabled={!canSave} onClick={handleSave} data-cy="edit-payment-info-modal-button-save">
          Save changes
        </Button>
      </div>
    </Modal>
  );
}
