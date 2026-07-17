import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, TextAreaField, InfoNote } from '@/components/FormField';
import { Info } from 'lucide-react';
import type { CertificateCitation } from '@/types';
import { cn } from '@/lib/utils';
export interface CitationFormValues {
  title: string;
  appliesTo: 'Trainee' | 'Seminar' | 'Both';
  bodyText: string;
  critical: boolean;
}
const EMPTY: CitationFormValues = {
  title: '',
  appliesTo: 'Trainee',
  bodyText: '',
  critical: false
};
const TOKENS = ['{{name}}', '{{school}}', '{{program}}', '{{industry}}', '{{hours}}', '{{dateStarted}}', '{{dateCompleted}}', '{{seminarTopic}}', '{{date}}'];
interface AddEditCitationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: CitationFormValues) => void;
  initial?: CertificateCitation | null;
}
export function AddEditCitationModal({
  open,
  onClose,
  onSave,
  initial
}: AddEditCitationModalProps) {
  const isEdit = !!initial;
  const [values, setValues] = useState<CitationFormValues>(EMPTY);
  const [errors, setErrors] = useState<{
    title?: string;
    bodyText?: string;
  }>({});
  useEffect(() => {
    if (open) {
      setValues(initial ? {
        title: initial.title,
        appliesTo: initial.appliesTo,
        bodyText: initial.bodyText,
        critical: !!initial.critical
      } : EMPTY);
      setErrors({});
    }
  }, [open, initial]);
  function insertToken(token: string) {
    setValues(v => ({
      ...v,
      bodyText: v.bodyText ? `${v.bodyText} ${token}` : token
    }));
  }
  function handleSubmit() {
    const nextErrors: typeof errors = {};
    if (!values.title.trim()) nextErrors.title = 'Citation title is required.';
    if (!values.bodyText.trim()) nextErrors.bodyText = 'Citation text is required.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSave({
      title: values.title.trim(),
      appliesTo: values.appliesTo,
      bodyText: values.bodyText.trim(),
      critical: values.critical
    });
  }
  return <Modal open={open} onClose={onClose} title={isEdit ? 'Edit citation' : 'Add citation'} description="Citations are the write-ups printed on trainee and seminar certificates. Use tokens below to auto-fill recipient details at generation time." maxWidth={520} data-cy="add-edit-citation-modal-modal-close">
      <TextField label="Citation title" placeholder="e.g. Standard OJT Completion" value={values.title} onChange={e => {
      setValues(v => ({
        ...v,
        title: e.target.value
      }));
      setErrors(er => ({
        ...er,
        title: undefined
      }));
    }} data-cy="add-edit-citation-modal-text-field-citation-title" />
      {errors.title && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-edit-citation-modal-p-3">{errors.title}</p>}

      <div className="mb-3.5" data-cy="add-edit-citation-modal-div-4">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600" data-cy="add-edit-citation-modal-label-applies-to">Applies to</label>
        <div className="flex overflow-hidden rounded-md border border-neutral-200" data-cy="add-edit-citation-modal-div-6">
          {(['Trainee', 'Seminar', 'Both'] as const).map(opt => <button key={opt} type="button" onClick={() => setValues(v => ({
          ...v,
          appliesTo: opt
        }))} className={cn('flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors', values.appliesTo === opt ? 'bg-brand-500 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50')} data-cy="add-edit-citation-modal-button-button">
              {opt}
            </button>)}
        </div>
      </div>

      <TextAreaField label="Citation text" placeholder='e.g. This is to certify that {{name}} has successfully completed {{hours}} hours...' rows={5} value={values.bodyText} onChange={e => {
      setValues(v => ({
        ...v,
        bodyText: e.target.value
      }));
      setErrors(er => ({
        ...er,
        bodyText: undefined
      }));
    }} data-cy="add-edit-citation-modal-text-area-field-citation-text" />
      {errors.bodyText && <p className="-mt-2.5 mb-2 text-xs font-medium text-danger-600" data-cy="add-edit-citation-modal-p-9">{errors.bodyText}</p>}

      <div className="mb-4 flex flex-wrap gap-1.5" data-cy="add-edit-citation-modal-div-10">
        {TOKENS.map(t => <button key={t} type="button" onClick={() => insertToken(t)} className="rounded-pill border border-dashed border-neutral-300 px-2 py-1 font-mono text-[10px] text-neutral-500 hover:border-brand-300 hover:text-brand-600" data-cy="add-edit-citation-modal-button-button-2">
            {t}
          </button>)}
      </div>

      <InfoNote data-cy="add-edit-citation-modal-info-note-12">
        <Info size={14} className="mt-0.5 shrink-0 text-neutral-400" data-cy="add-edit-citation-modal-info-13" />
        <span data-cy="add-edit-citation-modal-span-tokens-are-replaced-automatically-with-each">Tokens are replaced automatically with each recipient&rsquo;s details when a certificate is generated or printed.</span>
      </InfoNote>

      <label className="mb-5 -mt-2 flex cursor-pointer items-start gap-2 rounded-md bg-neutral-50 px-3 py-2.5 text-xs text-neutral-600" data-cy="add-edit-citation-modal-label-15">
        <input type="checkbox" checked={values.critical} onChange={e => setValues(v => ({
        ...v,
        critical: e.target.checked
      }))} className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-brand-500" data-cy="add-edit-citation-modal-input-checkbox" />
        <span data-cy="add-edit-citation-modal-span-critical-citations-are-protected-from-permanent">
          <strong className="text-neutral-700" data-cy="add-edit-citation-modal-strong-mark-as-critical">Mark as critical.</strong> Critical citations are protected from permanent
          deletion — they can only be archived, to preserve the historical record of certificates already issued using them.
        </span>
      </label>

      <div className="flex gap-2" data-cy="add-edit-citation-modal-div-19">
        <Button variant="secondary" className="flex-1" onClick={onClose} data-cy="add-edit-citation-modal-button-close">
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit} data-cy="add-edit-citation-modal-button-submit">
          {isEdit ? 'Save changes' : 'Add citation'}
        </Button>
      </div>
    </Modal>;
}