import { Check, Copy, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { copyText } from '@/lib/clipboard';
interface RegistrationData {
  url: string;
  /** Inline SVG markup for the QR code (backend-generated, trusted origin). */
  qr: string;
}

/**
 * Displays a batch's public registration link + a scannable QR code. The QR
 * SVG is generated server-side and embedded via innerHTML (our own API is the
 * trusted source). Opening/scanning the link routes guests to the public view.
 */
export function BatchRegistrationModal({
  batchId,
  batchCode,
  onClose
}: {
  batchId: number | string | null;
  batchCode?: string;
  onClose: () => void;
}) {
  const {
    showToast
  } = useToast();
  const [data, setData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (batchId == null) {
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    setData(null);
    setCopied(false);
    apiFetchJson<RegistrationData>(`/batches/${batchId}/registration`).then(res => active && setData(res.data)).catch(e => active && setError(e instanceof Error ? e.message : 'Failed to load registration link.')).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [batchId]);
  const copy = async () => {
    if (!data) {
      return;
    }
    const ok = await copyText(data.url);
    if (!ok) {
      showToast('Please copy the link manually.', 'error');
      return;
    }
    setCopied(true);
    showToast('Registration link copied', 'success');
    setTimeout(() => setCopied(false), 1500);
  };
  return <Modal open={batchId != null} onClose={onClose} title="Registration link" description={batchCode ? `Public sign-up link & QR for ${batchCode}.` : 'Public sign-up link & QR code.'} data-cy="batch-registration-modal-modal-registration-link">
            {loading && <div className="flex items-center justify-center py-10 text-neutral-400" data-cy="batch-registration-modal-div-2">
                    <Loader2 className="h-5 w-5 animate-spin" data-cy="batch-registration-modal-loader2-3" />
                </div>}

            {error && <p className="py-6 text-center text-sm text-danger-600" data-cy="batch-registration-modal-p-4">
                    {error}
                </p>}

            {data && <div className="flex flex-col items-center gap-4" data-cy="batch-registration-modal-div-5">
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 [&_svg]:h-44 [&_svg]:w-44" dangerouslySetInnerHTML={{
        __html: data.qr
      }} data-cy="batch-registration-modal-div-6" />
                    <div className="flex w-full items-center gap-2" data-cy="batch-registration-modal-div-7">
                        <input readOnly value={data.url} onFocus={e => e.target.select()} className="h-9 flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-600" data-cy="batch-registration-modal-input-8" />
                        <button type="button" onClick={copy} className="flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50" data-cy="batch-registration-modal-button-button">
                            {copied ? <Check size={14} className="text-success-600" data-cy="batch-registration-modal-check-10" /> : <Copy size={14} data-cy="batch-registration-modal-copy-11" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-center text-xs text-neutral-400" data-cy="batch-registration-modal-p-scanning-or-opening-this-link-routes">
                        Scanning or opening this link routes guests to the
                        public registration page.
                    </p>
                </div>}
        </Modal>;
}