import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/Button';
import { errorInputCls, Field, inputCls, textareaCls } from '@/components/form/Field';
import { InfoNote } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';
import type { SeminarEmailTemplate } from '@/types';
interface Props {
  open: boolean;
  onClose: () => void;
  template: SeminarEmailTemplate | null;
  onSave: (id: string, patch: Partial<SeminarEmailTemplate>) => void;
  onSendTest?: (id: string) => void;
}

type TemplateDraft = {
  subject: string;
  body: string;
};

// Mirrors SeminarEmailNotificationController::updateTemplate(): subject is
// `sometimes|string|max:255`, body is `sometimes|string`. The modal always
// submits both together, so both are required client-side for a sane UX.
const templateSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, 'Subject is required.')
    .max(255, 'Subject must be 255 characters or fewer.'),
  body: z.string().trim().min(1, 'Body is required.'),
}) satisfies z.ZodType<TemplateDraft>;

export function EditEmailTemplateModal({
  open,
  onClose,
  template,
  onSave,
  onSendTest
}: Props) {
  const {
    showToast
  } = useToast();
  const [preview, setPreview] = useState(false);
  const {
    register,
    watch,
    reset,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting: submitting },
  } = useForm<TemplateDraft>({
    resolver: zodResolver(templateSchema),
    defaultValues: { subject: '', body: '' },
  });
  const [formError, setFormError] = useState<string | null>(null);
  const body = watch('body');
  const subject = watch('subject');

  useEffect(() => {
    if (template) {
      reset({ subject: template.subject, body: template.body });
      setPreview(false);
      setFormError(null);
    }
  }, [template, reset]);

  if (!template) {
return null;
}

  const sample: Record<string, string> = {
    name: 'Carla Dizon',
    seminarTopic: 'Intro to Data Privacy for HR Teams',
    seminarDate: 'Jul 18, 2026',
    venue: 'FBS Training Room, Makati',
    fee: '750'
  };
  function render(text: string) {
    return text.replace(/{{\s*(\w+)\s*}}/g, (_, key) => sample[key] ?? `{{${key}}}`);
  }
  async function onValid(draft: TemplateDraft) {
    setFormError(null);

    try {
      await onSave(template!.id, {
        ...draft,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      showToast('Email template updated.', 'success');
      onClose();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to save template.',
      );
    }
  }
  function sendTest() {
    if (onSendTest) {
      onSendTest(template!.id);
    } else {
      showToast(`Test email "${subject}" sent to your inbox.`, 'success');
    }
  }

  return <Modal open={open} onClose={onClose} title={template.name} maxWidth={520} data-cy="edit-email-template-modal-modal-template-name">
      <InfoNote data-cy="edit-email-template-modal-info-note-2">{template.trigger}</InfoNote>

      <form onSubmit={handleFormSubmit(onValid)} className="space-y-0" data-cy="edit-email-template-modal-form-submit">
        <Field label="Subject" error={errors.subject?.message} data-cy="edit-email-template-modal-field-subject">
          <input className={cn(inputCls, errors.subject && errorInputCls)} {...register('subject')} data-cy="edit-email-template-modal-text-field-subject" />
        </Field>

        <div className="mb-1 flex items-center justify-between" data-cy="edit-email-template-modal-div-4">
          <label className="mb-1.5 block text-xs font-medium text-neutral-600" data-cy="edit-email-template-modal-label-body">Body</label>
          <button type="button" onClick={() => setPreview(v => !v)} className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-brand-500 hover:text-brand-600" data-cy="edit-email-template-modal-button-set-preview">
            {preview ? <EyeOff size={12} data-cy="edit-email-template-modal-eye-off-7" /> : <Eye size={12} data-cy="edit-email-template-modal-eye-8" />}
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {preview ? <div className="mb-3.5 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap" data-cy="edit-email-template-modal-div-9">
            {render(body)}
          </div> : <Field label="" error={errors.body?.message} data-cy="edit-email-template-modal-field-body">
            <textarea className={cn(textareaCls, errors.body && errorInputCls, '!mb-0')} rows={7} {...register('body')} data-cy="edit-email-template-modal-text-area-field-set-body" />
          </Field>}

        <p className="mb-4 mt-2 text-[11px] text-neutral-400" data-cy="edit-email-template-modal-p-placeholders">
          Placeholders: {'{{name}}'}, {'{{seminarTopic}}'}, {'{{seminarDate}}'}, {'{{venue}}'}, {'{{fee}}'}
        </p>

        {formError && (
          <p className="text-danger-700 mb-3 rounded-md bg-danger-50 px-3 py-2 text-xs" data-cy="edit-email-template-modal-p-form-error">
            {formError}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2" data-cy="edit-email-template-modal-div-12">
          <Button type="button" variant="secondary" icon={Send} onClick={sendTest} data-cy="edit-email-template-modal-button-send-test">
            Send test email
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting} data-cy="edit-email-template-modal-button-close">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting} data-cy="edit-email-template-modal-button-save">
            {submitting && <Loader2 size={14} className="animate-spin" data-cy="edit-email-template-modal-loader" />}
            Save template
          </Button>
        </div>
      </form>
    </Modal>;
}
