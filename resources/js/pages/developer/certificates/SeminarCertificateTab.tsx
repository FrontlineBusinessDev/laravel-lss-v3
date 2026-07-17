import { useMemo, useState } from 'react';
import { Search, Printer, Eye, X, Award, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { Modal } from '@/components/Modal';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { seminars, seminarParticipants, certificateCitations } from '@/data/mockData';
import type { SeminarParticipant } from '@/types';
import { cn } from '@/lib/utils';
import { CertificateSheet, CertificateBatchPrint, type CertificateDoc } from './CertificatePrint';
import { renderCitation, tokensForSeminarParticipant } from './certificateUtils';
function certStatus(p: SeminarParticipant): 'Issued' | 'Not issued' | 'Not eligible' {
  if (p.certificate?.issued) return 'Issued';
  if (p.status === 'Feedback Completed' || p.status === 'Completed' || p.status === 'Certificate Sent') return 'Not issued';
  return 'Not eligible';
}
const STATUS_STYLE: Record<string, string> = {
  Issued: 'bg-success-50 text-success-800',
  'Not issued': 'bg-warning-50 text-warning-800',
  'Not eligible': 'bg-neutral-100 text-neutral-500'
};
function buildDoc(p: SeminarParticipant): CertificateDoc {
  const seminar = seminars.find(s => s.topic === p.seminarTopic);
  const citation = certificateCitations.find(c => c.id === p.certificate?.citationId);
  const citationText = citation ? renderCitation(citation.bodyText, tokensForSeminarParticipant(p, seminar)) : `This is to certify that ${p.name} has attended "${p.seminarTopic}".`;
  return {
    key: p.id,
    recipientName: p.name,
    subtitle: p.seminarTopic,
    citationText,
    certificateNo: p.certificate?.certificateNo ?? '—',
    issuedDate: p.certificate?.issuedDate
  };
}
export function SeminarCertificateTab() {
  const [query, setQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('All seminars');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewParticipant, setPreviewParticipant] = useState<SeminarParticipant | null>(null);
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [printQueue, setPrintQueue] = useState<SeminarParticipant[]>([]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return seminarParticipants.filter(p => !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.certificate?.certificateNo ?? '').toLowerCase().includes(q)).filter(p => topicFilter === 'All seminars' || p.seminarTopic === topicFilter).filter(p => statusFilter === 'All statuses' || certStatus(p) === statusFilter).sort((a, b) => a.name.localeCompare(b.name));
  }, [query, topicFilter, statusFilter]);
  const allVisibleSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));
  function toggleAll() {
    setSelected(prev => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filtered.forEach(p => next.delete(p.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach(p => next.add(p.id));
      return next;
    });
  }
  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  const printGeneratedAt = new Date().toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const selectedParticipants = seminarParticipants.filter(p => selected.has(p.id) && p.certificate?.issued);
  const printableSelectedCount = selectedParticipants.length;
  function handlePrintSelected() {
    setPrintQueue(selectedParticipants);
    setBulkPreviewOpen(true);
  }
  function triggerPrint() {
    window.print();
  }
  const previewDoc = previewParticipant ? buildDoc(previewParticipant) : null;
  const bulkDocs = printQueue.map(buildDoc);
  return <div data-cy="seminar-certificate-tab-div-1">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between no-print" data-cy="seminar-certificate-tab-div-2">
        <span className="text-xs text-neutral-500" data-cy="seminar-certificate-tab-span-of">
          {filtered.length} of {seminarParticipants.length} participant records
          {selected.size > 0 && <> · {selected.size} selected</>}
        </span>
        <Button variant="primary" size="sm" icon={Printer} className="w-full sm:w-auto" disabled={printableSelectedCount === 0} onClick={handlePrintSelected} data-cy="seminar-certificate-tab-button-print-selected">
          Print selected ({printableSelectedCount})
        </Button>
      </div>

      <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 no-print sm:flex-row sm:flex-wrap sm:items-center" data-cy="seminar-certificate-tab-div-5">
        <div className="relative w-full flex-1 sm:min-w-[200px]" data-cy="seminar-certificate-tab-div-6">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="seminar-certificate-tab-search-7" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email, or certificate no..." className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="seminar-certificate-tab-input-text" />
        </div>
        <div className="w-full sm:w-56" data-cy="seminar-certificate-tab-div-9">
          <Dropdown options={['All seminars', ...seminars.map(s => s.topic)]} value={topicFilter} onChange={setTopicFilter} data-cy="seminar-certificate-tab-dropdown-set-topic-filter" />
        </div>
        <div className="w-full sm:w-40" data-cy="seminar-certificate-tab-div-11">
          <Dropdown options={['All statuses', 'Issued', 'Not issued', 'Not eligible']} value={statusFilter} onChange={setStatusFilter} data-cy="seminar-certificate-tab-dropdown-set-status-filter" />
        </div>
        {(query || topicFilter !== 'All seminars' || statusFilter !== 'All statuses') && <button onClick={() => {
        setQuery('');
        setTopicFilter('All seminars');
        setStatusFilter('All statuses');
      }} className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700" data-cy="seminar-certificate-tab-button-set-query">
            <X size={13} data-cy="seminar-certificate-tab-x-14" /> Clear
          </button>}
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white no-print" data-cy="seminar-certificate-tab-div-15">
        <div className="overflow-x-auto lss-scrollbar" data-cy="seminar-certificate-tab-div-16">
          <table className="w-full min-w-[820px] border-collapse text-sm" data-cy="seminar-certificate-tab-table-17">
            <thead data-cy="seminar-certificate-tab-thead-18">
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="seminar-certificate-tab-tr-19">
                <th className="w-10 px-4 py-2.5" data-cy="seminar-certificate-tab-th-20">
                  <button onClick={toggleAll} aria-label="Select all" className="flex items-center text-neutral-400 hover:text-brand-600" data-cy="seminar-certificate-tab-button-select-all">
                    {allVisibleSelected ? <CheckSquare size={16} className="text-brand-600" data-cy="seminar-certificate-tab-check-square-22" /> : <Square size={16} data-cy="seminar-certificate-tab-square-23" />}
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium" data-cy="seminar-certificate-tab-th-participant">Participant</th>
                <th className="px-4 py-2.5 font-medium" data-cy="seminar-certificate-tab-th-seminar-topic">Seminar topic</th>
                <th className="px-4 py-2.5 font-medium" data-cy="seminar-certificate-tab-th-certificate-no">Certificate no.</th>
                <th className="px-4 py-2.5 font-medium" data-cy="seminar-certificate-tab-th-status">Status</th>
                <th className="px-4 py-2.5 font-medium" data-cy="seminar-certificate-tab-th-issued-date">Issued date</th>
                <th className="px-4 py-2.5 font-medium text-right" data-cy="seminar-certificate-tab-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody data-cy="seminar-certificate-tab-tbody-30">
              {filtered.map(p => {
              const status = certStatus(p);
              return <tr key={p.id} className="border-t border-neutral-100 transition-colors hover:bg-neutral-50" data-cy="seminar-certificate-tab-tr-31">
                    <td className="px-4 py-2.5" data-cy="seminar-certificate-tab-td-32">
                      <button onClick={() => toggleOne(p.id)} aria-label={`Select ${p.name}`} className="flex items-center text-neutral-400 hover:text-brand-600" data-cy="seminar-certificate-tab-button-toggle-one">
                        {selected.has(p.id) ? <CheckSquare size={16} className="text-brand-600" data-cy="seminar-certificate-tab-check-square-34" /> : <Square size={16} data-cy="seminar-certificate-tab-square-35" />}
                      </button>
                    </td>
                    <td className="px-4 py-2.5" data-cy="seminar-certificate-tab-td-36">
                      <div className="font-medium text-ink" data-cy="seminar-certificate-tab-div-37">{p.name}</div>
                      <div className="text-xs text-neutral-500" data-cy="seminar-certificate-tab-div-38">{p.email}</div>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600" data-cy="seminar-certificate-tab-td-39">{p.seminarTopic}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="seminar-certificate-tab-td-40">{p.certificate?.certificateNo ?? '—'}</td>
                    <td className="px-4 py-2.5" data-cy="seminar-certificate-tab-td-41">
                      <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[status])} data-cy="seminar-certificate-tab-span-42">
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="seminar-certificate-tab-td-43">{p.certificate?.issuedDate ?? '—'}</td>
                    <td className="px-4 py-2.5" data-cy="seminar-certificate-tab-td-44">
                      <div className="flex justify-end gap-0.5" data-cy="seminar-certificate-tab-div-45">
                        <TooltipIconButton icon={Eye} label="Preview & print" onClick={() => setPreviewParticipant(p)} disabled={!p.certificate?.issued} data-cy="seminar-certificate-tab-tooltip-icon-button-set-preview-participant" />
                      </div>
                    </td>
                  </tr>;
            })}
              {filtered.length === 0 && <tr data-cy="seminar-certificate-tab-tr-47">
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-neutral-400" data-cy="seminar-certificate-tab-td-no-certificate-records-match-your-search">
                    <Award size={20} className="mx-auto mb-2 text-neutral-300" data-cy="seminar-certificate-tab-award-49" />
                    No certificate records match your search or filters.
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single certificate preview & print */}
      <Modal open={!!previewParticipant} onClose={() => setPreviewParticipant(null)} title="Certificate preview" maxWidth={680} data-cy="seminar-certificate-tab-modal-certificate-preview">
        {previewParticipant && previewDoc && <div className="flex flex-col gap-4" data-cy="seminar-certificate-tab-div-51">
            <CertificateSheet doc={previewDoc} data-cy="seminar-certificate-tab-certificate-sheet-52" />
            <div className="flex justify-end gap-2" data-cy="seminar-certificate-tab-div-53">
              <Button variant="secondary" icon={X} onClick={() => setPreviewParticipant(null)} data-cy="seminar-certificate-tab-button-set-preview-participant">Close</Button>
              <Button variant="primary" icon={Printer} onClick={() => {
            setPrintQueue([previewParticipant]);
            setTimeout(triggerPrint, 50);
          }} data-cy="seminar-certificate-tab-button-set-print-queue">
                Print
              </Button>
            </div>
          </div>}
      </Modal>

      {/* Bulk certificate preview & print */}
      <Modal open={bulkPreviewOpen} onClose={() => setBulkPreviewOpen(false)} title={`Print preview — ${printQueue.length} certificate${printQueue.length === 1 ? '' : 's'}`} maxWidth={680} data-cy="seminar-certificate-tab-modal-set-bulk-preview-open">
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto lss-scrollbar pr-1" data-cy="seminar-certificate-tab-div-57">
          {bulkDocs.map(doc => <CertificateSheet key={doc.key} doc={doc} data-cy="seminar-certificate-tab-certificate-sheet-58" />)}
        </div>
        <div className="mt-4 flex justify-end gap-2" data-cy="seminar-certificate-tab-div-59">
          <Button variant="secondary" icon={X} onClick={() => setBulkPreviewOpen(false)} data-cy="seminar-certificate-tab-button-set-bulk-preview-open">Close</Button>
          <Button variant="primary" icon={Printer} onClick={triggerPrint} data-cy="seminar-certificate-tab-button-trigger-print">Print all</Button>
        </div>
      </Modal>

      {printQueue.length > 0 && <CertificateBatchPrint docs={printQueue.map(buildDoc)} data-cy="seminar-certificate-tab-certificate-batch-print-62" />}
      <p className="mt-2 text-[11px] text-neutral-400 no-print" data-cy="seminar-certificate-tab-p-generated">Generated {printGeneratedAt}</p>
    </div>;
}