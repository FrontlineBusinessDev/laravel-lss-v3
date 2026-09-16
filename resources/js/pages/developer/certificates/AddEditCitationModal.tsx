import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { errorInputCls, Field, inputCls, textareaCls } from '@/components/form/Field';
import { InfoNote } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import type { CertificateAppliesTo, CertificateCitation } from './types';

interface FormValues {
  title: string;
  applies_to: CertificateAppliesTo;
  body_text: string;
  critical: boolean;
}

const EMPTY: FormValues = {
  title: '',
  applies_to: 'trainee',
  body_text: '',
  critical: false,
};

const TOKENS = ['{{name}}', '{{school}}', '{{hours}}', '{{seminarTopic}}', '{{date}}'];
const APPLIES_TO_OPTIONS = ['trainee', 'seminar', 'both'] as const;

// Mirrors CitationController::storeRules()/updateRules(): title, applies_to,
// body_text required; critical is nullable boolean, status is set implicitly
// (kept off the form — persist() below defaults it to the existing/'active' value).
const citationSchema = z.object({
  title: z.string().trim().min(1, 'Citation title is required.'),
  applies_to: z.enum(['trainee', 'seminar', 'both']),
  body_text: z.string().trim().min(1, 'Citation text is required.'),
  critical: z.boolean(),
}) satisfies z.ZodType<FormValues>;

interface AddEditCitationModalProps {
  open: boolean;
  initial?: CertificateCitation | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AddEditCitationModal({ open, initial, onClose, onSaved }: AddEditCitationModalProps) {
  const { showToast } = useToast();
  const isEdit = !!initial;
  const {
    control,
    register,
    setError,
    setValue,
    getValues,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting: submitting },
  } = useForm<FormValues>({
    resolver: zodResolver(citationSchema),
    defaultValues: EMPTY,
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      initial
        ? {
            title: initial.title,
            applies_to: initial.applies_to,
            body_text: initial.body_text,
            critical: !!initial.critical,
          }
        : EMPTY,
    );
    setFormError(null);
  }, [open, initial, reset]);

  function insertToken(token: string) {
    const current = getValues('body_text');
    setValue('body_text', current ? `${current} ${token}` : token, { shouldDirty: true, shouldValidate: true });
  }

  async function onValid(values: FormValues) {
    setFormError(null);

    try {
      const payload = {
        title: values.title.trim(),
        applies_to: values.applies_to,
        body_text: values.body_text.trim(),
        critical: values.critical,
        status: initial?.status ?? 'active',
      };
      if (isEdit && initial) {
        await apiFetchJson(`/certificates/citations/${initial.id}`, { method: 'POST', body: JSON.stringify(payload) });
        showToast(`"${payload.title}" was updated.`, 'success');
      } else {
        await apiFetchJson('/certificates/citations', { method: 'POST', body: JSON.stringify(payload) });
        showToast(`"${payload.title}" was added.`, 'success');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to save citation.');
      const apiErrors = (error as Error & { errors?: Record<string, string[]> }).errors;

      if (apiErrors) {
        Object.entries(apiErrors).forEach(([key, msgs]) => {
          if (key in EMPTY) {
            setError(key as keyof FormValues, {
              message: Array.isArray(msgs) ? msgs[0] : String(msgs),
            });
          }
        });
      }

      setFormError(error.message);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit citation' : 'Add citation'}
      description="Citations are the write-ups printed on trainee and seminar certificates. Use tokens below to auto-fill recipient details at generation time."
      maxWidth={520}
      data-cy="add-edit-citation-modal-modal"
    >
      <form onSubmit={handleFormSubmit(onValid)} className="space-y-0" data-cy="add-edit-citation-modal-form-submit">
        <Field label="Citation title" error={errors.title?.message} data-cy="add-edit-citation-modal-field-title">
          <input
            placeholder="e.g. Standard OJT Completion"
            className={cn(inputCls, errors.title && errorInputCls)}
            {...register('title')}
            data-cy="add-edit-citation-modal-text-field-title"
          />
        </Field>

        <Field label="Applies to" data-cy="add-edit-citation-modal-field-applies-to">
          <Controller
            control={control}
            name="applies_to"
            render={({ field }) => (
              <div className="flex overflow-hidden rounded-md border border-neutral-200" data-cy="add-edit-citation-modal-div-applies-to">
                {APPLIES_TO_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => field.onChange(opt)}
                    className={cn(
                      'flex-1 px-2.5 py-1.5 text-xs font-medium capitalize transition-colors',
                      field.value === opt ? 'bg-brand-500 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50',
                    )}
                    data-cy="add-edit-citation-modal-button-applies-to"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          />
        </Field>

        <Field label="Citation text" error={errors.body_text?.message} data-cy="add-edit-citation-modal-field-body">
          <textarea
            placeholder='e.g. This is to certify that {{name}} has successfully completed {{hours}} hours...'
            rows={5}
            className={cn(textareaCls, errors.body_text && errorInputCls)}
            {...register('body_text')}
            data-cy="add-edit-citation-modal-text-area-field-body"
          />
        </Field>

        <div className="mb-4 flex flex-wrap gap-1.5" data-cy="add-edit-citation-modal-div-tokens">
          {TOKENS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => insertToken(t)}
              className="rounded-pill border border-dashed border-neutral-300 px-2 py-1 font-mono text-[10px] text-neutral-500 hover:border-brand-300 hover:text-brand-600"
              data-cy="add-edit-citation-modal-button-token"
            >
              {t}
            </button>
          ))}
        </div>

        <InfoNote data-cy="add-edit-citation-modal-info-note">
          <Info size={14} className="mt-0.5 shrink-0 text-neutral-400" />
          <span>Tokens are replaced automatically with each recipient&rsquo;s details when a certificate is generated or printed.</span>
        </InfoNote>

        <label className="mb-5 -mt-2 flex cursor-pointer items-start gap-2 rounded-md bg-neutral-50 px-3 py-2.5 text-xs text-neutral-600" data-cy="add-edit-citation-modal-label-critical">
          <input type="checkbox" {...register('critical')} className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-brand-500" data-cy="add-edit-citation-modal-input-critical" />
          <span>
            <strong className="text-neutral-700">Mark as critical.</strong> Critical citations are protected from permanent deletion — they can only be
            archived, to preserve the historical record of certificates already issued using them.
          </span>
        </label>

        {formError && (
          <p className="text-danger-700 rounded-md bg-danger-50 px-3 py-2 text-xs" data-cy="add-edit-citation-modal-p-form-error">
            {formError}
          </p>
        )}

        <div className="flex gap-2" data-cy="add-edit-citation-modal-div-buttons">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
            data-cy="add-edit-citation-modal-button-close"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
            data-cy="add-edit-citation-modal-button-submit"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" data-cy="add-edit-citation-modal-loader" />}
            {isEdit ? 'Save changes' : 'Add citation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
