import { useState } from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import type { FieldOption } from '@/types/reusable/fields';
import { CertificateSheet, type CertificateDoc } from './CertificatePrint';
import { renderCitation } from './certificateUtils';
import type { CertificateTemplate } from './types';

interface LookupItem {
  id: number;
  title?: string;
  name?: string;
  is_default?: boolean;
}

interface CitationRecord {
  id: number;
  title: string;
  body_text: string;
  applies_to: 'trainee' | 'seminar' | 'both';
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

/** The default template for a certificate_type, if one exists — used to preview what issuing without an explicit template will actually resolve to (see TraineeCertificateController/SeminarCertificateController's defaultTemplateId() fallback). */
async function findDefaultTemplateId(certificateType: 'trainee' | 'seminar'): Promise<number | null> {
  const res = await apiFetchJson<LookupItem[]>(`/certificates/templates/lookup?status=active&certificate_type=${certificateType}`);
  const match = (res.data ?? []).find((item) => item.is_default);
  return match ? match.id : null;
}

interface IssueCertificateModalProps {
  open: boolean;
  recipientName: string;
  appliesTo: 'trainee' | 'seminar';
  issueUrl: string;
  /** Course/program (trainee) or seminar topic — used for the {{course_title}}/{{seminarTopic}} preview token and the doc's courseTitle. */
  courseTitle?: string;
  /** School / batch line shown as the certificate subtitle in preview. */
  subtitle?: string;
  /** Required hours — trainee certificates only, used for the {{hours}} citation token in preview. */
  requiredHours?: string | number;
  onClose: () => void;
  onIssued: () => void;
}

export function IssueCertificateModal({
  open,
  recipientName,
  appliesTo,
  issueUrl,
  courseTitle,
  subtitle,
  requiredHours,
  onClose,
  onIssued,
}: IssueCertificateModalProps) {
  const { showToast } = useToast();
  const [citationId, setCitationId] = useState<unknown>(null);
  const [templateId, setTemplateId] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<CertificateDoc | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [issuedVerificationUrl, setIssuedVerificationUrl] = useState<string | null>(null);

  function reset() {
    setCitationId(null);
    setTemplateId(null);
    setPreviewDoc(null);
    setShowSuccess(false);
    setIssuedVerificationUrl(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handlePreview() {
    if (!citationId) return;
    setPreviewing(true);

    try {
      const citationRes = await apiFetchJson<CitationRecord>(`/certificates/citations/${citationId}/preview-data`);
      const citation = citationRes.data;

      let template: CertificateTemplate | null = null;
      const resolvedTemplateId = templateId || (await findDefaultTemplateId(appliesTo));
      if (resolvedTemplateId) {
        const templateRes = await apiFetchJson<CertificateTemplate>(`/certificates/templates/${resolvedTemplateId}/preview-data`);
        template = templateRes.data;
      }

      setPreviewDoc({
        key: 'preview',
        recipientName,
        subtitle: subtitle ?? '',
        citationText: renderCitation(citation.body_text, { name: recipientName, hours: requiredHours, seminarTopic: courseTitle }),
        certificateNo: 'PREVIEW',
        issuedDate: new Date().toISOString().slice(0, 10),
        courseTitle,
        template,
        achievedOutcomes: [],
      });
    } catch {
      showToast('Failed to build certificate preview.', 'error');
    } finally {
      setPreviewing(false);
    }
  }

  async function handleIssue() {
    if (!citationId) return;
    setSaving(true);
    try {
      const res = await apiFetchJson<{ verification_url?: string | null }>(issueUrl, {
        method: 'POST',
        body: JSON.stringify({ citation_id: citationId, template_id: templateId || null }),
      });
      showToast('Certificate issued successfully.', 'success');
      setIssuedVerificationUrl(res.data?.verification_url ?? null);
      setShowSuccess(true);
      onIssued();
    } catch {
      showToast('Failed to issue certificate.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={showSuccess ? 'Certificate issued' : 'Issue certificate'}
      description={showSuccess ? undefined : `Choose the citation and (optionally) the layout template for ${recipientName}'s certificate.`}
      maxWidth={640}
      data-cy="issue-certificate-modal-modal"
    >
      {showSuccess ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center" data-cy="issue-certificate-modal-div-success">
          <CheckCircle2 size={40} className="text-success-600" />
          <p className="text-sm text-neutral-600">
            The certificate for <span className="font-medium text-ink">{recipientName}</span> has been issued.
          </p>
          <div className="mt-2 flex w-full gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleClose}>
              Done
            </Button>
            {issuedVerificationUrl && (
              <Button
                variant="primary"
                className="flex-1"
                icon={ExternalLink}
                onClick={() => window.open(issuedVerificationUrl, '_blank', 'noopener')}
              >
                View public certificate
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3.5" data-cy="issue-certificate-modal-div-citation">
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">Citation</label>
            <AsyncSelectField
              value={citationId}
              onChange={(v) => {
                setCitationId(v);
                setPreviewDoc(null);
              }}
              placeholder="Select a citation…"
              loadOptions={(q) => loadCitationOptions(appliesTo, q)}
            />
          </div>

          <div className="mb-5" data-cy="issue-certificate-modal-div-template">
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">Template (optional)</label>
            <AsyncSelectField
              value={templateId}
              onChange={(v) => {
                setTemplateId(v);
                setPreviewDoc(null);
              }}
              placeholder="Default layout"
              loadOptions={(q) => loadTemplateOptions(appliesTo, q)}
            />
          </div>

          {previewDoc && (
            <div className="mb-5" data-cy="issue-certificate-modal-div-preview">
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">Preview</label>
              <CertificateSheet doc={previewDoc} variant="preview" />
            </div>
          )}

          <div className="flex gap-2" data-cy="issue-certificate-modal-div-actions">
            <Button variant="secondary" className="flex-1" onClick={handleClose} data-cy="issue-certificate-modal-button-close">
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              disabled={!citationId || previewing}
              onClick={() => void handlePreview()}
              data-cy="issue-certificate-modal-button-preview"
            >
              {previewing ? 'Loading…' : previewDoc ? 'Refresh preview' : 'Preview'}
            </Button>
            <Button variant="primary" className="flex-1" disabled={!citationId || saving} onClick={() => void handleIssue()} data-cy="issue-certificate-modal-button-issue">
              {saving ? 'Issuing…' : 'Issue certificate'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
