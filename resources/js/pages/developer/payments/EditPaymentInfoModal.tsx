import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { errorInputCls, Field, inputCls } from '@/components/form/Field';
import { InfoNote } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import type { AppPaymentDetail } from './types';
import { traineeFullName } from './types';

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

const numberInRange = (v: string, min: number, max: number) =>
  v === '' || (!Number.isNaN(Number(v)) && Number(v) >= min && Number(v) <= max);

// Mirrors TraineesController::updateBillingOverrides(): all three fields are
// nullable numeric — blank clears the override — with the same min/max as
// the backend rules (rate up to 999999.99, both discounts 0-100).
const overrideSchema = z.object({
  override_rate_per_hour: z
    .string()
    .refine((v) => numberInRange(v, 0, 999999.99), 'Override rate per hour must be a number between 0 and 999999.99.'),
  override_hours_discount_percent: z
    .string()
    .refine((v) => numberInRange(v, 0, 100), 'Override hours discount % must be a number between 0 and 100.'),
  override_group_discount_percent: z
    .string()
    .refine((v) => numberInRange(v, 0, 100), 'Override group discount % must be a number between 0 and 100.'),
}) satisfies z.ZodType<BillingOverrideFormValues>;

interface EditPaymentInfoModalProps {
  open: boolean;
  traineeId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditPaymentInfoModal({ open, traineeId, onClose, onSaved }: EditPaymentInfoModalProps) {
  const { showToast } = useToast();
  const [trainee, setTrainee] = useState<AppPaymentDetail | null>(null);
  const {
    register,
    setError,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting: submitting },
  } = useForm<BillingOverrideFormValues>({
    resolver: zodResolver(overrideSchema),
    defaultValues: EMPTY,
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || traineeId == null) {
      return;
    }

    apiFetchJson<AppPaymentDetail>(`/payments/${traineeId}`).then((res) => {
      setTrainee(res.data);
      reset({
        override_rate_per_hour: res.data.override_rate_per_hour ?? '',
        override_hours_discount_percent: res.data.override_hours_discount_percent ?? '',
        override_group_discount_percent: res.data.override_group_discount_percent ?? '',
      });
    });
  }, [open, traineeId, reset]);

  async function onValid(values: BillingOverrideFormValues) {
    if (traineeId == null) {
      return;
    }

    setFormError(null);

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
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to update payment information.');
      const apiErrors = (error as Error & { errors?: Record<string, string[]> }).errors;

      if (apiErrors) {
        Object.entries(apiErrors).forEach(([key, msgs]) => {
          if (key in EMPTY) {
            setError(key as keyof BillingOverrideFormValues, {
              message: Array.isArray(msgs) ? msgs[0] : String(msgs),
            });
          }
        });
      }

      setFormError(error.message);
    }
  }

  if (!trainee) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit payment information"
      description={`Override ${traineeFullName(trainee)}'s billing rate or discount percentages. Leave a field blank to fall back to the batch/school default.`}
      maxWidth={440}
      data-cy="edit-payment-info-modal-modal-edit-payment-information"
    >
      <form onSubmit={handleFormSubmit(onValid)} className="space-y-0" data-cy="edit-payment-info-modal-form-submit">
        <InfoNote data-cy="edit-payment-info-modal-info-note-2">
          Default (from batch/school): rate {trainee.applied_rate_per_hour}/hr, {trainee.hours_discount_percent}% hours discount, {trainee.group_discount_percent}% group
          discount. Setting an override here recalculates the net amount due.
        </InfoNote>

        <Field label="Override rate per hour" required={false} error={errors.override_rate_per_hour?.message} data-cy="edit-payment-info-modal-field-override-rate">
          <input
            type="number"
            min={0}
            step="0.01"
            className={cn(inputCls, errors.override_rate_per_hour && errorInputCls)}
            {...register('override_rate_per_hour')}
            data-cy="edit-payment-info-modal-text-field-override-rate"
          />
        </Field>
        <Field
          label="Override hours discount %"
          required={false}
          error={errors.override_hours_discount_percent?.message}
          data-cy="edit-payment-info-modal-field-override-hours-discount"
        >
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            className={cn(inputCls, errors.override_hours_discount_percent && errorInputCls)}
            {...register('override_hours_discount_percent')}
            data-cy="edit-payment-info-modal-text-field-override-hours-discount"
          />
        </Field>
        <Field
          label="Override group discount %"
          required={false}
          error={errors.override_group_discount_percent?.message}
          data-cy="edit-payment-info-modal-field-override-group-discount"
        >
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            className={cn(inputCls, errors.override_group_discount_percent && errorInputCls)}
            {...register('override_group_discount_percent')}
            data-cy="edit-payment-info-modal-text-field-override-group-discount"
          />
        </Field>

        {formError && (
          <p className="text-danger-700 rounded-md bg-danger-50 px-3 py-2 text-xs" data-cy="edit-payment-info-modal-p-form-error">
            {formError}
          </p>
        )}

        <div className="flex gap-2" data-cy="edit-payment-info-modal-div-12">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
            data-cy="edit-payment-info-modal-button-close"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
            data-cy="edit-payment-info-modal-button-save"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" data-cy="edit-payment-info-modal-loader" />}
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
