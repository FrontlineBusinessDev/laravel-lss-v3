import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { errorInputCls, Field, inputCls } from '@/components/form/Field';
import { TextAreaField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { cn } from '@/lib/utils';
import type { BiometricLogRow } from '@/types/modules/biometrics/biometrics';

export interface RecordFormValues {
  date: string;
  morningTimeIn: string;
  lunchTimeOut: string;
  afternoonTimeIn: string;
  dayTimeOut: string;
  onLeave: boolean;
  remarks: string;
}

const EMPTY: RecordFormValues = {
  date: '',
  morningTimeIn: '',
  lunchTimeOut: '',
  afternoonTimeIn: '',
  dayTimeOut: '',
  onLeave: false,
  remarks: '',
};

// Mirrors BiometricsController::updateRecord(): date required (Y-m-d);
// morning/lunch/afternoon/day time fields are nullable date_format:H:i
// regardless of on_leave (the backend clears them server-side when on
// leave); on_leave required boolean; remarks nullable string.
const recordSchema = z.object({
  date: z.string().min(1, 'Date is required.'),
  morningTimeIn: z.string(),
  lunchTimeOut: z.string(),
  afternoonTimeIn: z.string(),
  dayTimeOut: z.string(),
  onLeave: z.boolean(),
  remarks: z.string(),
}) satisfies z.ZodType<RecordFormValues>;

interface EditRecordModalProps {
  record: BiometricLogRow | null;
  onClose: () => void;
  onSave: (id: number, values: RecordFormValues) => Promise<void>;
}

export function EditRecordModal({ record, onClose, onSave }: EditRecordModalProps) {
  const {
    control,
    register,
    handleSubmit: handleFormSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting: submitting },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: EMPTY,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const onLeave = watch('onLeave');

  useEffect(() => {
    if (record) {
      reset({
        date: record.date,
        morningTimeIn: record.morning_time_in ?? '',
        lunchTimeOut: record.lunch_time_out ?? '',
        afternoonTimeIn: record.afternoon_time_in ?? '',
        dayTimeOut: record.day_time_out ?? '',
        onLeave: record.on_leave,
        remarks: record.remarks ?? '',
      });
      setFormError(null);
    }
  }, [record, reset]);

  async function onValid(values: RecordFormValues) {
    if (!record) {
      return;
    }

    setFormError(null);

    try {
      await onSave(record.id, values);
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update record.');
    }
  }

  return (
    <Modal
      open={!!record}
      onClose={onClose}
      title="Edit attendance record"
      description={record ? `Editing ${record.trainee_name}'s record` : undefined}
      maxWidth={460}
      data-cy="edit-record-modal-modal-edit-attendance-record"
    >
      {record && (
        <form onSubmit={handleFormSubmit(onValid)} className="space-y-0" data-cy="edit-record-modal-form-submit">
          <Field label="Date" error={errors.date?.message} data-cy="edit-record-modal-field-date">
            <input
              type="date"
              className={cn(inputCls, errors.date && errorInputCls)}
              {...register('date')}
              data-cy="edit-record-modal-text-field-date"
            />
          </Field>

          <Field label="On leave" data-cy="edit-record-modal-field-on-leave">
            <Controller
              control={control}
              name="onLeave"
              render={({ field }) => (
                <select
                  className={inputCls}
                  value={field.value ? 'Yes' : 'No'}
                  onChange={(e) => field.onChange(e.target.value === 'Yes')}
                  data-cy="edit-record-modal-select-field-on-leave"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              )}
            />
          </Field>

          {!onLeave && (
            <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-0" data-cy="edit-record-modal-div-4">
              <Field label="Morning time in" data-cy="edit-record-modal-field-morning-in">
                <input type="time" className={inputCls} {...register('morningTimeIn')} data-cy="edit-record-modal-text-field-morning-in" />
              </Field>
              <Field label="Lunch out" data-cy="edit-record-modal-field-lunch-out">
                <input type="time" className={inputCls} {...register('lunchTimeOut')} data-cy="edit-record-modal-text-field-lunch-out" />
              </Field>
              <Field label="After lunch time in" data-cy="edit-record-modal-field-afternoon-in">
                <input type="time" className={inputCls} {...register('afternoonTimeIn')} data-cy="edit-record-modal-text-field-afternoon-in" />
              </Field>
              <Field label="Day time out" data-cy="edit-record-modal-field-day-out">
                <input type="time" className={inputCls} {...register('dayTimeOut')} data-cy="edit-record-modal-text-field-day-out" />
              </Field>
            </div>
          )}

          <TextAreaField
            label="Remarks"
            optional
            placeholder={onLeave ? 'e.g. Sick Leave' : 'Optional note for this record...'}
            {...register('remarks')}
            data-cy="edit-record-modal-text-area-field-remarks"
          />

          {formError && (
            <p className="text-danger-700 rounded-md bg-danger-50 px-3 py-2 text-xs" data-cy="edit-record-modal-p-form-error">
              {formError}
            </p>
          )}

          <div className="mt-2 flex gap-2" data-cy="edit-record-modal-div-8">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
              data-cy="edit-record-modal-button-close"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
              data-cy="edit-record-modal-button-save"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" data-cy="edit-record-modal-loader" />}
              Save changes
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
