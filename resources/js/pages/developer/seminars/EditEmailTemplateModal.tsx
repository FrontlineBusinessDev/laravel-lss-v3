import { useEffect, useState } from 'react';
import { Send, Eye, EyeOff } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, TextAreaField, InfoNote } from '@/components/FormField';
import { useToast } from '@/components/Toast';
import type { SeminarEmailTemplate } from '@/types';
interface Props {
  open: boolean;
  onClose: () => void;
  template: SeminarEmailTemplate | null;
  onSave: (id: string, patch: Partial<SeminarEmailTemplate>) => void;
}
export function EditEmailTemplateModal({
  open,
  onClose,
  template,
  onSave
}: Props) {
  const {
    showToast
  } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setPreview(false);
    }
  }, [template]);
  if (!template) return null;
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
  function handleSave() {
    onSave(template!.id, {
      subject,
      body,
      updatedAt: new Date().toISOString().slice(0, 10)
    });
    showToast('Email template updated.', 'success');
    onClose();
  }
  function sendTest() {
    showToast(`Test email "${subject}" sent to your inbox.`, 'success');
  }
  return <Modal open={open} onClose={onClose} title={template.name} maxWidth={520} data-cy="edit-email-template-modal-modal-template-name">
      <InfoNote data-cy="edit-email-template-modal-info-note-2">{template.trigger}</InfoNote>

      <TextField label="Subject" value={subject} onChange={e => setSubject(e.target.value)} data-cy="edit-email-template-modal-text-field-subject" />

      <div className="mb-1 flex items-center justify-between" data-cy="edit-email-template-modal-div-4">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600" data-cy="edit-email-template-modal-label-body">Body</label>
        <button onClick={() => setPreview(v => !v)} className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-brand-500 hover:text-brand-600" data-cy="edit-email-template-modal-button-set-preview">
          {preview ? <EyeOff size={12} data-cy="edit-email-template-modal-eye-off-7" /> : <Eye size={12} data-cy="edit-email-template-modal-eye-8" />}
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {preview ? <div className="mb-3.5 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap" data-cy="edit-email-template-modal-div-9">
          {render(body)}
        </div> : <TextAreaField label="" value={body} onChange={e => setBody(e.target.value)} rows={7} className="!mb-0" data-cy="edit-email-template-modal-text-area-field-set-body" />}

      <p className="mb-4 mt-2 text-[11px] text-neutral-400" data-cy="edit-email-template-modal-p-placeholders">
        Placeholders: {'{{name}}'}, {'{{seminarTopic}}'}, {'{{seminarDate}}'}, {'{{venue}}'}, {'{{fee}}'}
      </p>

      <div className="flex flex-wrap justify-end gap-2" data-cy="edit-email-template-modal-div-12">
        <Button variant="secondary" icon={Send} onClick={sendTest} data-cy="edit-email-template-modal-button-send-test">
          Send test email
        </Button>
        <Button variant="secondary" onClick={onClose} data-cy="edit-email-template-modal-button-close">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} data-cy="edit-email-template-modal-button-save">
          Save template
        </Button>
      </div>
    </Modal>;
}