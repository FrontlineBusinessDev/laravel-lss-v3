import { useMemo, useState } from 'react';
import { Search, Printer, Eye, X, Award, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { Modal } from '@/components/Modal';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { certificateCitations } from '@/data/mockData';
import { useBatches } from '@/context/BatchesContext';
import type { Trainee } from '@/types';
import { cn } from '@/lib/utils';
import { CertificateSheet, CertificateBatchPrint, type CertificateDoc } from './CertificatePrint';
import { renderCitation, tokensForTrainee } from './certificateUtils';
function certStatus(t: Trainee): 'Issued' | 'Not issued' | 'Not eligible' {
  if (t.certificate?.issued) return 'Issued';
  if (t.completedHrs >= t.requiredHrs) return 'Not issued';
  return 'Not eligible';
}
const STATUS_STYLE: Record<string, string> = {
  Issued: 'bg-success-50 text-success-800',
  'Not issued': 'bg-warning-50 text-warning-800',
  'Not eligible': 'bg-neutral-100 text-neutral-500'
};
function buildDoc(t: Trainee): CertificateDoc {
  const citation = certificateCitations.find(c => c.id === t.certificate?.citationId);
  const citationText = citation ? renderCitation(citation.bodyText, tokensForTrainee(t)) : `This is to certify that ${t.name} has completed ${t.requiredHrs} hours of training in ${t.industry} under the ${t.programType} program.`;
  return {
    key: t.id,
    recipientName: t.name,
    subtitle: `${t.programType} — ${t.industry}`,
    citationText,
    certificateNo: t.certificate?.certificateNo ?? '—',
    issuedDate: t.certificate?.issuedDate
  };
}
export function TraineesCertificateTab() {
  const {
    trainees,
    batches
  } = useBatches();
  const [query, setQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('All batches');
  const [programFilter, setProgramFilter] = useState('All programs');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewTrainee, setPreviewTrainee] = useState<Trainee | null>(null);
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [printQueue, setPrintQueue] = useState<Trainee[]>([]);
  const programOptions = useMemo(() => ['All programs', ...Array.from(new Set(trainees.map(t => t.programType)))], []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trainees.filter(t => !q || t.name.toLowerCase().includes(q) || (t.certificate?.certificateNo ?? '').toLowerCase().includes(q) || t.school.toLowerCase().includes(q)).filter(t => batchFilter === 'All batches' || t.batchNo === batchFilter).filter(t => programFilter === 'All programs' || t.programType === programFilter).filter(t => statusFilter === 'All statuses' || certStatus(t) === statusFilter).sort((a, b) => a.name.localeCompare(b.name));
  }, [query, batchFilter, programFilter, statusFilter]);
  const allVisibleSelected = filtered.length > 0 && filtered.every(t => selected.has(t.id));
  function toggleAll() {
    setSelected(prev => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filtered.forEach(t => next.delete(t.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach(t => next.add(t.id));
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
  const selectedTrainees = trainees.filter(t => selected.has(t.id) && t.certificate?.issued);
  const selectedCount = selected.size;
  const printableSelectedCount = selectedTrainees.length;
  function handlePrintSelected() {
    setPrintQueue(selectedTrainees);
    setBulkPreviewOpen(true);
  }
  function triggerPrint() {
    window.print();
  }
  const previewDoc = previewTrainee ? buildDoc(previewTrainee) : null;
  const bulkDocs = printQueue.map(buildDoc);
  return <div data-cy="trainees-certificate-tab-div-1">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between no-print" data-cy="trainees-certificate-tab-div-2">
        <span className="text-xs text-neutral-500" data-cy="trainees-certificate-tab-span-of">
          {filtered.length} of {trainees.length} trainee records
          {selectedCount > 0 && <> · {selectedCount} selected</>}
        </span>
        <Button variant="primary" size="sm" icon={Printer} className="w-full sm:w-auto" disabled={printableSelectedCount === 0} onClick={handlePrintSelected} data-cy="trainees-certificate-tab-button-print-selected">
          Print selected ({printableSelectedCount})
        </Button>
      </div>

      <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 no-print sm:flex-row sm:flex-wrap sm:items-center" data-cy="trainees-certificate-tab-div-5">
        <div className="relative w-full flex-1 sm:min-w-[200px]" data-cy="trainees-certificate-tab-div-6">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="trainees-certificate-tab-search-7" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by trainee, school, or certificate no..." className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="trainees-certificate-tab-input-text" />
        </div>
        <div className="w-full sm:w-40" data-cy="trainees-certificate-tab-div-9">
          <Dropdown options={['All batches', ...batches.map(b => b.batchNo)]} value={batchFilter} onChange={setBatchFilter} data-cy="trainees-certificate-tab-dropdown-set-batch-filter" />
        </div>
        <div className="w-full sm:w-44" data-cy="trainees-certificate-tab-div-11">
          <Dropdown options={programOptions} value={programFilter} onChange={setProgramFilter} data-cy="trainees-certificate-tab-dropdown-set-program-filter" />
        </div>
        <div className="w-full sm:w-40" data-cy="trainees-certificate-tab-div-13">
          <Dropdown options={['All statuses', 'Issued', 'Not issued', 'Not eligible']} value={statusFilter} onChange={setStatusFilter} data-cy="trainees-certificate-tab-dropdown-set-status-filter" />
        </div>
        {(query || batchFilter !== 'All batches' || programFilter !== 'All programs' || statusFilter !== 'All statuses') && <button onClick={() => {
        setQuery('');
        setBatchFilter('All batches');
        setProgramFilter('All programs');
        setStatusFilter('All statuses');
      }} className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700" data-cy="trainees-certificate-tab-button-set-query">
            <X size={13} data-cy="trainees-certificate-tab-x-16" /> Clear
          </button>}
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white no-print" data-cy="trainees-certificate-tab-div-17">
        <div className="overflow-x-auto lss-scrollbar" data-cy="trainees-certificate-tab-div-18">
          <table className="w-full min-w-[880px] border-collapse text-sm" data-cy="trainees-certificate-tab-table-19">
            <thead data-cy="trainees-certificate-tab-thead-20">
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="trainees-certificate-tab-tr-21">
                <th className="w-10 px-4 py-2.5" data-cy="trainees-certificate-tab-th-22">
                  <button onClick={toggleAll} aria-label="Select all" className="flex items-center text-neutral-400 hover:text-brand-600" data-cy="trainees-certificate-tab-button-select-all">
                    {allVisibleSelected ? <CheckSquare size={16} className="text-brand-600" data-cy="trainees-certificate-tab-check-square-24" /> : <Square size={16} data-cy="trainees-certificate-tab-square-25" />}
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium" data-cy="trainees-certificate-tab-th-trainee">Trainee</th>
                <th className="px-4 py-2.5 font-medium" data-cy="trainees-certificate-tab-th-batch">Batch</th>
                <th className="px-4 py-2.5 font-medium" data-cy="trainees-certificate-tab-th-program">Program</th>
                <th className="px-4 py-2.5 font-medium" data-cy="trainees-certificate-tab-th-certificate-no">Certificate no.</th>
                <th className="px-4 py-2.5 font-medium" data-cy="trainees-certificate-tab-th-status">Status</th>
                <th className="px-4 py-2.5 font-medium" data-cy="trainees-certificate-tab-th-issued-date">Issued date</th>
                <th className="px-4 py-2.5 font-medium text-right" data-cy="trainees-certificate-tab-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody data-cy="trainees-certificate-tab-tbody-33">
              {filtered.map(t => {
              const status = certStatus(t);
              return <tr key={t.id} className="border-t border-neutral-100 transition-colors hover:bg-neutral-50" data-cy="trainees-certificate-tab-tr-34">
                    <td className="px-4 py-2.5" data-cy="trainees-certificate-tab-td-35">
                      <button onClick={() => toggleOne(t.id)} aria-label={`Select ${t.name}`} className="flex items-center text-neutral-400 hover:text-brand-600" data-cy="trainees-certificate-tab-button-toggle-one">
                        {selected.has(t.id) ? <CheckSquare size={16} className="text-brand-600" data-cy="trainees-certificate-tab-check-square-37" /> : <Square size={16} data-cy="trainees-certificate-tab-square-38" />}
                      </button>
                    </td>
                    <td className="px-4 py-2.5" data-cy="trainees-certificate-tab-td-39">
                      <div className="font-medium text-ink" data-cy="trainees-certificate-tab-div-40">{t.name}</div>
                      <div className="text-xs text-neutral-500" data-cy="trainees-certificate-tab-div-41">{t.school}</div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="trainees-certificate-tab-td-42">{t.batchNo}</td>
                    <td className="px-4 py-2.5 text-neutral-600" data-cy="trainees-certificate-tab-td-43">{t.programType}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="trainees-certificate-tab-td-44">{t.certificate?.certificateNo ?? '—'}</td>
                    <td className="px-4 py-2.5" data-cy="trainees-certificate-tab-td-45">
                      <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[status])} data-cy="trainees-certificate-tab-span-46">
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="trainees-certificate-tab-td-47">{t.certificate?.issuedDate ?? '—'}</td>
                    <td className="px-4 py-2.5" data-cy="trainees-certificate-tab-td-48">
                      <div className="flex justify-end gap-0.5" data-cy="trainees-certificate-tab-div-49">
                        <TooltipIconButton icon={Eye} label="Preview & print" onClick={() => setPreviewTrainee(t)} disabled={!t.certificate?.issued} data-cy="trainees-certificate-tab-tooltip-icon-button-set-preview-trainee" />
                      </div>
                    </td>
                  </tr>;
            })}
              {filtered.length === 0 && <tr data-cy="trainees-certificate-tab-tr-51">
                  <td colSpan={8} className="px-4 py-10 text-center text-xs text-neutral-400" data-cy="trainees-certificate-tab-td-no-certificate-records-match-your-search">
                    <Award size={20} className="mx-auto mb-2 text-neutral-300" data-cy="trainees-certificate-tab-award-53" />
                    No certificate records match your search or filters.
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single certificate preview & print */}
      <Modal open={!!previewTrainee} onClose={() => setPreviewTrainee(null)} title="Certificate preview" maxWidth={680} data-cy="trainees-certificate-tab-modal-certificate-preview">
        {previewTrainee && previewDoc && <div className="flex flex-col gap-4" data-cy="trainees-certificate-tab-div-55">
            <CertificateSheet doc={previewDoc} data-cy="trainees-certificate-tab-certificate-sheet-56" />
            <div className="flex justify-end gap-2" data-cy="trainees-certificate-tab-div-57">
              <Button variant="secondary" icon={X} onClick={() => setPreviewTrainee(null)} data-cy="trainees-certificate-tab-button-set-preview-trainee">Close</Button>
              <Button variant="primary" icon={Printer} onClick={() => {
            setPrintQueue([previewTrainee]);
            setTimeout(triggerPrint, 50);
          }} data-cy="trainees-certificate-tab-button-set-print-queue">
                Print
              </Button>
            </div>
          </div>}
      </Modal>

      {/* Bulk certificate preview & print */}
      <Modal open={bulkPreviewOpen} onClose={() => setBulkPreviewOpen(false)} title={`Print preview — ${printQueue.length} certificate${printQueue.length === 1 ? '' : 's'}`} maxWidth={680} data-cy="trainees-certificate-tab-modal-set-bulk-preview-open">
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto lss-scrollbar pr-1" data-cy="trainees-certificate-tab-div-61">
          {bulkDocs.map(doc => <CertificateSheet key={doc.key} doc={doc} data-cy="trainees-certificate-tab-certificate-sheet-62" />)}
        </div>
        <div className="mt-4 flex justify-end gap-2" data-cy="trainees-certificate-tab-div-63">
          <Button variant="secondary" icon={X} onClick={() => setBulkPreviewOpen(false)} data-cy="trainees-certificate-tab-button-set-bulk-preview-open">Close</Button>
          <Button variant="primary" icon={Printer} onClick={triggerPrint} data-cy="trainees-certificate-tab-button-trigger-print">Print all</Button>
        </div>
      </Modal>

      {printQueue.length > 0 && <CertificateBatchPrint docs={printQueue.map(buildDoc)} data-cy="trainees-certificate-tab-certificate-batch-print-66" />}
      <p className="mt-2 text-[11px] text-neutral-400 no-print" data-cy="trainees-certificate-tab-p-generated">Generated {printGeneratedAt}</p>
    </div>;
}