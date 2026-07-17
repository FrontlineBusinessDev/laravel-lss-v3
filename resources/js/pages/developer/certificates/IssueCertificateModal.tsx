import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import type { FieldOption } from '@/types/reusable/fields';

interface LookupItem {
  id: number;
  title?: string;
  name?: string;
}

async function loadCitationOptions(appliesTo: 'trainee' | 'seminar', query: string): Promise<FieldOption[]> {
  const res = await apiFetchJson<LookupItem[]>(
    `/certificates/citations/lookup?status=active&applies_to=${appliesTo}&q=${encodeURIComponent(query)}`,
  );
  return (res.data ?? []).map((item) => ({ value: String(item.id), label: item.title ?? '' }));
}

async function loadTemplateOptions(certificateType: 'trainee' | 'seminar', query: string): Promise<FieldOption[]> {
  const res = await apiFetchJson<LookupItem[]>(
    `/certificates/templates/lookup?status=active&certificate_type=${certificateType}&q=${encodeURIComponent(query)}`,
  );
  return (res.data ?? []).map((item) => ({ value: String(item.id), label: item.name ?? '' }));
}

interface IssueCertificateModalProps {
  open: boolean;
  recipientName: string;
  appliesTo: 'trainee' | 'seminar';
  issueUrl: string;
  onClose: () => void;
  onIssued: () => void;
}

export function IssueCertificateModal({ open, recipientName, appliesTo, issueUrl, onClose, onIssued }: IssueCertificateModalProps) {
  const { showToast } = useToast();
  const [citationId, setCitationId] = useState<unknown>(null);
  const [templateId, setTemplateId] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setCitationId(null);
    setTemplateId(null);
  }

  async function handleIssue() {
    if (!citationId) return;
    setSaving(true);
    try {
      await apiFetchJson(issueUrl, {
        method: 'POST',
        body: JSON.stringify({ citation_id: citationId, template_id: templateId || null }),
      });
      showToast('Certificate issued successfully.', 'success');
      onIssued();
      reset();
      onClose();
    } catch {
      showToast('Failed to issue certificate.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Issue certificate"
      description={`Choose the citation and (optionally) the layout template for ${recipientName}'s certificate.`}
      maxWidth={440}
      data-cy="issue-certificate-modal-modal"
    >
      <div className="mb-3.5" data-cy="issue-certificate-modal-div-citation">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">Citation</label>
        <AsyncSelectField
          value={citationId}
          onChange={setCitationId}
          placeholder="Select a citation…"
          loadOptions={(q) => loadCitationOptions(appliesTo, q)}
        />
      </div>

      <div className="mb-5" data-cy="issue-certificate-modal-div-template">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">Template (optional)</label>
        <AsyncSelectField
          value={templateId}
          onChange={setTemplateId}
          placeholder="Default layout"
          loadOptions={(q) => loadTemplateOptions(appliesTo, q)}
        />
      </div>

      <div className="flex gap-2" data-cy="issue-certificate-modal-div-actions">
        <Button variant="secondary" className="flex-1" onClick={onClose} data-cy="issue-certificate-modal-button-close">
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" disabled={!citationId || saving} onClick={handleIssue} data-cy="issue-certificate-modal-button-issue">
          Issue certificate
        </Button>
      </div>
    </Modal>
  );
}
