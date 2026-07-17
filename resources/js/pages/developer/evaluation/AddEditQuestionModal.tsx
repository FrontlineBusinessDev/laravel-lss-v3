import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextAreaField } from '@/components/FormField';
import type { EvaluationQuestion } from '@/types';
export interface QuestionFormValues {
  question: string;
  critical: boolean;
  type: 'rating' | 'text';
  section: string;
}
interface AddEditQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: QuestionFormValues) => void;
  initial?: EvaluationQuestion | null;
  categoryLabel: string; // "trainer" | "seminar" — used in copy
  questionSet: string;
}
const EMPTY: QuestionFormValues = {
  question: '',
  critical: false,
  type: 'rating',
  section: ''
};
export function AddEditQuestionModal({
  open,
  onClose,
  onSave,
  initial,
  categoryLabel,
  questionSet
}: AddEditQuestionModalProps) {
  const isEdit = !!initial;
  const [values, setValues] = useState<QuestionFormValues>(EMPTY);
  const [error, setError] = useState('');
  useEffect(() => {
    if (open) {
      setValues(initial ? {
        question: initial.question,
        critical: !!initial.critical,
        type: initial.type,
        section: initial.section ?? ''
      } : EMPTY);
      setError('');
    }
  }, [open, initial]);
  function handleSubmit() {
    if (!values.question.trim()) {
      setError('Question text is required.');
      return;
    }
    onSave({
      question: values.question.trim(),
      critical: values.critical,
      type: values.type,
      section: values.section.trim()
    });
  }
  return <Modal open={open} onClose={onClose} title={isEdit ? 'Edit evaluation question' : 'Add evaluation question'} description={`This question will be shown to ${categoryLabel === 'trainer' ? 'trainees evaluating their trainer' : 'participants evaluating the resource speaker'} under the "${questionSet}" question set.`} maxWidth={440} data-cy="add-edit-question-modal-modal-close">
      <TextAreaField label="Question" placeholder={categoryLabel === 'trainer' ? 'e.g. The trainer explained tasks and expectations clearly.' : 'e.g. The resource speaker demonstrated strong command of the topic.'} rows={4} value={values.question} onChange={e => {
      setValues(v => ({
        ...v,
        question: e.target.value
      }));
      setError('');
    }} data-cy="add-edit-question-modal-text-area-field-question" />
      {error && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-edit-question-modal-p-3">{error}</p>}

      <div className="mb-3.5 grid grid-cols-2 gap-2" data-cy="add-edit-question-modal-div-4">
        <div data-cy="add-edit-question-modal-div-5">
          <label className="mb-1 block text-xs font-medium text-neutral-600" data-cy="add-edit-question-modal-label-answer-type">Answer type</label>
          <div className="flex overflow-hidden rounded-md border border-neutral-200" data-cy="add-edit-question-modal-div-7">
            <button type="button" onClick={() => setValues(v => ({
            ...v,
            type: 'rating'
          }))} className={`flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${values.type === 'rating' ? 'bg-brand-500 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`} data-cy="add-edit-question-modal-button-button">
              Rating (1-5)
            </button>
            <button type="button" onClick={() => setValues(v => ({
            ...v,
            type: 'text'
          }))} className={`flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${values.type === 'text' ? 'bg-brand-500 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`} data-cy="add-edit-question-modal-button-button-2">
              Written answer
            </button>
          </div>
        </div>
        <div data-cy="add-edit-question-modal-div-10">
          <label className="mb-1 block text-xs font-medium text-neutral-600" data-cy="add-edit-question-modal-label-section-optional">Section (optional)</label>
          <input type="text" value={values.section} onChange={e => setValues(v => ({
          ...v,
          section: e.target.value
        }))} placeholder="e.g. Work Readiness" className="h-[30px] w-full rounded-md border border-neutral-200 px-2 text-xs transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="add-edit-question-modal-input-e-g-work-readiness" />
        </div>
      </div>

      <label className="mb-4 flex cursor-pointer items-start gap-2 rounded-md bg-neutral-50 px-3 py-2.5 text-xs text-neutral-600" data-cy="add-edit-question-modal-label-13">
        <input type="checkbox" checked={values.critical} onChange={e => setValues(v => ({
        ...v,
        critical: e.target.checked
      }))} className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-brand-500" data-cy="add-edit-question-modal-input-checkbox" />
        <span data-cy="add-edit-question-modal-span-critical-questions-are-protected-from-permanent">
          <strong className="text-neutral-700" data-cy="add-edit-question-modal-strong-mark-as-critical">Mark as critical.</strong> Critical questions are protected from permanent deletion —
          they can only be archived, to preserve historical evaluation data.
        </span>
      </label>

      <div className="flex gap-2" data-cy="add-edit-question-modal-div-17">
        <Button variant="secondary" className="flex-1" onClick={onClose} data-cy="add-edit-question-modal-button-close">
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit} data-cy="add-edit-question-modal-button-submit">
          {isEdit ? 'Save changes' : 'Add question'}
        </Button>
      </div>
    </Modal>;
}