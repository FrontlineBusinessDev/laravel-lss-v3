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
import { renderCitation, tokensForTrainee } from '../certificateUtils';
import { IssueCertificateModal } from '../IssueCertificateModal';
import { traineeCertName, traineeCertStatus, type TraineeCertificateRow } from '../types';

const GRID = 'sm:grid sm:grid-cols-[1.6fr_1.2fr_1fr_1fr_1fr_2.5rem_2.5rem] sm:items-center sm:gap-3';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'issued', label: 'Issued' },
  { value: 'not_issued', label: 'Not issued' },
  { value: 'not_eligible', label: 'Not eligible' },
];

const STATUS_STYLE: Record<string, string> = {
  issued: 'bg-success-50 text-success-800',
  not_issued: 'bg-warning-50 text-warning-800',
  not_eligible: 'bg-neutral-100 text-neutral-500',
};

const STATUS_LABEL: Record<string, string> = {
  issued: 'Issued',
  not_issued: 'Not issued',
  not_eligible: 'Not eligible',
};

const columns: ColumnDef<TraineeCertificateRow>[] = [
  { key: 'last_name', label: 'Trainee' },
  { key: 'batch', label: 'Batch', sortable: false },
  { key: 'certificate_no', label: 'Certificate no.', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'issued_at', label: 'Issued date', sortable: false },
  {
    key: 'batch_id',
    label: 'Batch',
    filterable: true,
    sortable: false,
    type: 'async-multi-select',
    loadOptions: (q) => loadLookupOptions('/batches', q, 'batch_code'),
  },
  {
    key: 'school_id',
    label: 'School',
    filterable: true,
    sortable: false,
    type: 'async-multi-select',
    loadOptions: (q) => loadLookupOptions('/settings/partner-schools', q, 'school_name'),
  },
];

const listHeader = (
  <div className={cn('hidden bg-neutral-50 px-4 py-2.5 text-left text-xs font-medium text-neutral-500', GRID)} data-cy="trainee-certificates-index-list-header">
    <span>Trainee</span>
    <span>Batch</span>
    <span>Certificate no.</span>
    <span>Status</span>
    <span>Issued date</span>
    <span className="text-right">Preview</span>
    <span className="text-right">Issue</span>
  </div>
);

function buildDoc(row: TraineeCertificateRow): CertificateDoc {
  return {
    key: row.id,
    recipientName: traineeCertName(row),
    subtitle: row.school?.school_name ?? '',
    citationText: row.certificate?.citation
      ? `This is to certify that ${traineeCertName(row)} has completed ${row.required_hours} hours of training.`
      : renderCitation('This is to certify that {{name}} has completed {{hours}} hours of training.', tokensForTrainee(row)),
    certificateNo: row.certificate?.certificate_no ?? '—',
    issuedDate: row.certificate?.issued_at,
    template: row.certificate?.template,
  };
}

export default function TraineeCertificatesPage() {
  const [previewRow, setPreviewRow] = useState<TraineeCertificateRow | null>(null);
  const [issueRow, setIssueRow] = useState<TraineeCertificateRow | null>(null);
  const [refreshTable, setRefreshTable] = useState<() => void>(() => () => {});

  function renderRow(row: TraineeCertificateRow) {
    const status = traineeCertStatus(row);
    return (
      <div className={cn('px-4 py-3 text-sm', GRID)} data-cy="trainee-certificates-index-row">
        <div className="min-w-0" data-cy="trainee-certificates-index-div-name">
          <div className="truncate font-medium text-ink">{traineeCertName(row)}</div>
          <div className="truncate text-xs text-neutral-500">{row.school?.school_name ?? '—'}</div>
        </div>
        <span className="font-mono text-xs text-neutral-600">{row.batch?.batch_code ?? '—'}</span>
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
          <Button variant="secondary" size="sm" disabled={status === 'not_eligible'} onClick={() => setIssueRow(row)}>
            Issue
          </Button>
        </div>
      </div>
    );
  }

  const previewDoc = previewRow ? buildDoc(previewRow) : null;

  return (
    <CertificatesPrimaryLayout data-cy="trainee-certificates-index-layout">
      <DataTableCardField<TraineeCertificateRow>
        apiUrl="/certificates/trainees"
        apiQueryKey="certificates-trainees"
        columns={columns}
        defaultSortBy="last_name"
        enableStatusFilter
        statusFilterOptions={STATUS_FILTER_OPTIONS}
        listHeader={listHeader}
        renderCard={(row) => renderRow(row)}
        onRefreshRef={(fn) => setRefreshTable(() => fn)}
      />

      {previewDoc && (
        <PreviewOverlay doc={previewDoc} onClose={() => setPreviewRow(null)} />
      )}

      {issueRow && (
        <IssueCertificateModal
          open={!!issueRow}
          recipientName={traineeCertName(issueRow)}
          appliesTo="trainee"
          issueUrl={`/certificates/trainees/${issueRow.id}/issue`}
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
      data-cy="trainee-certificates-index-preview-overlay"
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
