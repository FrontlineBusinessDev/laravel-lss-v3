import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, TextAreaField, InfoNote } from '@/components/FormField';
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

interface AddEditCitationModalProps {
  open: boolean;
  initial?: CertificateCitation | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AddEditCitationModal({ open, initial, onClose, onSaved }: AddEditCitationModalProps) {
  const { showToast } = useToast();
  const isEdit = !!initial;
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<{ title?: string; body_text?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(
        initial
          ? {
              title: initial.title,
              applies_to: initial.applies_to,
              body_text: initial.body_text,
              critical: !!initial.critical,
            }
          : EMPTY,
      );
      setErrors({});
    }
  }, [open, initial]);

  function insertToken(token: string) {
    setValues((v) => ({ ...v, body_text: v.body_text ? `${v.body_text} ${token}` : token }));
  }

  async function handleSubmit() {
    const nextErrors: typeof errors = {};
    if (!values.title.trim()) nextErrors.title = 'Citation title is required.';
    if (!values.body_text.trim()) nextErrors.body_text = 'Citation text is required.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
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
    } catch {
      showToast('Failed to save citation.', 'error');
    } finally {
      setSaving(false);
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
      <TextField
        label="Citation title"
        placeholder="e.g. Standard OJT Completion"
        value={values.title}
        onChange={(e) => {
          setValues((v) => ({ ...v, title: e.target.value }));
          setErrors((er) => ({ ...er, title: undefined }));
        }}
        data-cy="add-edit-citation-modal-text-field-title"
      />
      {errors.title && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.title}</p>}

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">Applies to</label>
        <div className="flex overflow-hidden rounded-md border border-neutral-200">
          {(['trainee', 'seminar', 'both'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setValues((v) => ({ ...v, applies_to: opt }))}
              className={cn(
                'flex-1 px-2.5 py-1.5 text-xs font-medium capitalize transition-colors',
                values.applies_to === opt ? 'bg-brand-500 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <TextAreaField
        label="Citation text"
        placeholder='e.g. This is to certify that {{name}} has successfully completed {{hours}} hours...'
        rows={5}
        value={values.body_text}
        onChange={(e) => {
          setValues((v) => ({ ...v, body_text: e.target.value }));
          setErrors((er) => ({ ...er, body_text: undefined }));
        }}
        data-cy="add-edit-citation-modal-text-area-field-body"
      />
      {errors.body_text && <p className="-mt-2.5 mb-2 text-xs font-medium text-danger-600">{errors.body_text}</p>}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TOKENS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => insertToken(t)}
            className="rounded-pill border border-dashed border-neutral-300 px-2 py-1 font-mono text-[10px] text-neutral-500 hover:border-brand-300 hover:text-brand-600"
          >
            {t}
          </button>
        ))}
      </div>

      <InfoNote data-cy="add-edit-citation-modal-info-note">
        <Info size={14} className="mt-0.5 shrink-0 text-neutral-400" />
        <span>Tokens are replaced automatically with each recipient&rsquo;s details when a certificate is generated or printed.</span>
      </InfoNote>

      <label className="mb-5 -mt-2 flex cursor-pointer items-start gap-2 rounded-md bg-neutral-50 px-3 py-2.5 text-xs text-neutral-600">
        <input
          type="checkbox"
          checked={values.critical}
          onChange={(e) => setValues((v) => ({ ...v, critical: e.target.checked }))}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-brand-500"
        />
        <span>
          <strong className="text-neutral-700">Mark as critical.</strong> Critical citations are protected from permanent deletion — they can only be
          archived, to preserve the historical record of certificates already issued using them.
        </span>
      </label>

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose} data-cy="add-edit-citation-modal-button-close">
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" disabled={saving} onClick={handleSubmit} data-cy="add-edit-citation-modal-button-submit">
          {isEdit ? 'Save changes' : 'Add citation'}
        </Button>
      </div>
    </Modal>
  );
}
