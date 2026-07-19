import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Award, Printer, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { loadLookupOptions } from '@/types/reusable/fields';
import type { ColumnDef } from '@/types/reusable/data-table';
import { cn } from '@/lib/utils';
import CertificatesPrimaryLayout from '@/layouts/certificates/CertificatesPrimaryLayout';
import { CertificateSheet, type CertificateDoc } from '../CertificatePrint';
import { renderCitation, tokensForSeminarParticipant } from '../certificateUtils';
import { IssueCertificateModal } from '../IssueCertificateModal';
import { seminarCertStatus, type SeminarCertificateRow } from '../types';

const GRID = 'sm:grid sm:grid-cols-[1.6fr_1.4fr_1fr_1fr_1fr_2.5rem_2.5rem] sm:items-center sm:gap-3';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'issued', label: 'Issued' },
  { value: 'not_issued', label: 'Not issued' },
];

const STATUS_STYLE: Record<string, string> = {
  issued: 'bg-success-50 text-success-800',
  not_issued: 'bg-warning-50 text-warning-800',
};

const STATUS_LABEL: Record<string, string> = {
  issued: 'Issued',
  not_issued: 'Not issued',
};

const columns: ColumnDef<SeminarCertificateRow>[] = [
  { key: 'name', label: 'Participant' },
  { key: 'seminar', label: 'Seminar', sortable: false },
  { key: 'certificate_no', label: 'Certificate no.', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'issued_at', label: 'Issued date', sortable: false },
  {
    key: 'seminar_id',
    label: 'Seminar',
    filterable: true,
    sortable: false,
    type: 'async-multi-select',
    loadOptions: (q) => loadLookupOptions('/seminars', q, 'topic'),
  },
];

const listHeader = (
  <div className={cn('hidden bg-neutral-50 px-4 py-2.5 text-left text-xs font-medium text-neutral-500', GRID)} data-cy="seminar-certificates-index-list-header">
    <span>Participant</span>
    <span>Seminar</span>
    <span>Certificate no.</span>
    <span>Status</span>
    <span>Issued date</span>
    <span className="text-right">Preview</span>
    <span className="text-right">Issue</span>
  </div>
);

function buildDoc(row: SeminarCertificateRow): CertificateDoc {
  return {
    key: row.id,
    recipientName: row.name,
    subtitle: row.seminar?.topic ?? '',
    citationText: renderCitation('This is to certify that {{name}} has attended "{{seminarTopic}}".', tokensForSeminarParticipant(row)),
    certificateNo: row.certificate?.certificate_no ?? '—',
    issuedDate: row.certificate?.issued_at,
    template: row.certificate?.template,
  };
}

export default function SeminarCertificatesPage() {
  const [previewRow, setPreviewRow] = useState<SeminarCertificateRow | null>(null);
  const [issueRow, setIssueRow] = useState<SeminarCertificateRow | null>(null);
  const [refreshTable, setRefreshTable] = useState<() => void>(() => () => {});

  function renderRow(row: SeminarCertificateRow) {
    const status = seminarCertStatus(row);
    return (
      <div className={cn('px-4 py-3 text-sm', GRID)} data-cy="seminar-certificates-index-row">
        <div className="min-w-0" data-cy="seminar-certificates-index-div-name">
          <div className="truncate font-medium text-ink">{row.name}</div>
          <div className="truncate text-xs text-neutral-500">{row.email}</div>
        </div>
        <span className="truncate text-neutral-600">{row.seminar?.topic ?? '—'}</span>
        <span className="font-mono text-xs text-neutral-600">{row.certificate?.certificate_no ?? '—'}</span>
        <span>
          <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[status])}>
            {STATUS_LABEL[status]}
          </span>
        </span>
        <span className="font-mono text-xs text-neutral-600">{row.certificate?.issued_at?.slice(0, 10) ?? '—'}</span>
        <div className="flex justify-end">
          <TooltipIconButton icon={Award} label="Preview certificate" onClick={() => setPreviewRow(row)} disabled={!row.certificate?.issued_at} />
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => setIssueRow(row)}>
            Issue
          </Button>
        </div>
      </div>
    );
  }

  const previewDoc = previewRow ? buildDoc(previewRow) : null;

  return (
    <CertificatesPrimaryLayout data-cy="seminar-certificates-index-layout">
      <DataTableCardField<SeminarCertificateRow>
        apiUrl="/certificates/seminar"
        apiQueryKey="certificates-seminar"
        columns={columns}
        defaultSortBy="name"
        enableStatusFilter
        statusFilterOptions={STATUS_FILTER_OPTIONS}
        listHeader={listHeader}
        renderCard={(row) => renderRow(row)}
        onRefreshRef={(fn) => setRefreshTable(() => fn)}
      />

      {previewDoc && <PreviewOverlay doc={previewDoc} onClose={() => setPreviewRow(null)} />}

      {issueRow && (
        <IssueCertificateModal
          open={!!issueRow}
          recipientName={issueRow.name}
          appliesTo="seminar"
          issueUrl={`/certificates/seminar/${issueRow.id}/issue`}
          onClose={() => setIssueRow(null)}
          onIssued={() => refreshTable()}
        />
      )}
    </CertificatesPrimaryLayout>
  );
}

function PreviewOverlay({ doc, onClose }: { doc: CertificateDoc; onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 animate-fadeIn no-print"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      data-cy="seminar-certificates-index-preview-overlay"
    >
      <div className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-lg bg-white p-6 shadow-modal animate-scaleIn lss-scrollbar">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-ink">Certificate preview</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-sm p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600">
            <X size={18} />
          </button>
        </div>
        <CertificateSheet variant="preview" doc={doc} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" icon={X} onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={Printer} onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
