import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Printer, X, ChevronDown, ChevronRight, ClipboardList, Wallet, Info } from 'lucide-react';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';
import { loadLookupOptions } from '@/types/reusable/fields';
import { reportService } from '@/api-service-layer/developer/report';
import { formatCurrency } from '../reportsUtils';
import { BatchReportPrint } from './BatchReportPrint';

interface BatchFilters {
  dateFrom: string;
  dateTo: string;
  industryId: string;
}
const EMPTY_FILTERS: BatchFilters = { dateFrom: '', dateTo: '', industryId: '' };
const ALL_INDUSTRIES = { value: '', label: 'All industries' };

export default function BatchReportView() {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [draftFilters, setDraftFilters] = useState<BatchFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<BatchFilters>(EMPTY_FILTERS);
  const [appliedQuery, setAppliedQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: industryOptions = [] } = useQuery({
    queryKey: ['academic-industries-lookup'],
    queryFn: () => loadLookupOptions('/settings/academic/industry', ''),
  });

  const { data } = useQuery({
    queryKey: ['reports-batch', appliedQuery, appliedFilters],
    queryFn: () =>
      reportService.batchSummary({
        search: appliedQuery || undefined,
        date_from: appliedFilters.dateFrom || undefined,
        date_to: appliedFilters.dateTo || undefined,
        academic_industry_id: appliedFilters.industryId ? Number(appliedFilters.industryId) : undefined,
      }),
  });

  const batches = data?.batches ?? [];
  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setAppliedQuery(query);
  };
  const cancelFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setQuery('');
    setAppliedQuery('');
  };
  const toggleExpand = (batchNo: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(batchNo)) next.delete(batchNo);else next.add(batchNo);
      return next;
    });
  };
  const expandAll = () => setExpanded(new Set(batches.map(b => b.batchNo)));
  const collapseAll = () => setExpanded(new Set());
  const dateRangeLabel = appliedFilters.dateFrom || appliedFilters.dateTo ? `${appliedFilters.dateFrom || 'Start'} – ${appliedFilters.dateTo || 'Present'}` : 'All dates';
  const printGeneratedAt = new Date().toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  function handlePrint() {
    if (batches.length === 0) {
      showToast('No records to print for the current filters.', 'error');
      return;
    }
    window.print();
  }
  return <>
      <div className="mb-3 flex flex-col gap-2.5 rounded-lg border border-neutral-200 bg-white p-3 no-print" data-cy="batch-report-view-div-1">
        <div className="flex flex-wrap items-end gap-2.5" data-cy="batch-report-view-div-2">
          <div className="relative w-full flex-1 sm:min-w-[220px]" data-cy="batch-report-view-div-3">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="batch-report-view-label-search">Search</label>
            <div className="relative" data-cy="batch-report-view-div-5">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="batch-report-view-search-6" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search batch no., program, or trainee..." className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="batch-report-view-input-text" />
            </div>
          </div>
          <div data-cy="batch-report-view-div-8">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="batch-report-view-label-date-from">Date from</label>
            <input type="date" value={draftFilters.dateFrom} onChange={e => setDraftFilters(f => ({
            ...f,
            dateFrom: e.target.value
          }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="batch-report-view-input-date" />
          </div>
          <div data-cy="batch-report-view-div-11">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="batch-report-view-label-date-to">Date to</label>
            <input type="date" value={draftFilters.dateTo} onChange={e => setDraftFilters(f => ({
            ...f,
            dateTo: e.target.value
          }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="batch-report-view-input-date-2" />
          </div>
          <div className="w-48" data-cy="batch-report-view-div-14">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="batch-report-view-label-industry">Industry</label>
            <Dropdown options={[ALL_INDUSTRIES, ...industryOptions]} value={draftFilters.industryId} onChange={v => setDraftFilters(f => ({
            ...f,
            industryId: v
          }))} data-cy="batch-report-view-dropdown-set-draft-filters" />
          </div>
          <div className="ml-auto flex gap-2" data-cy="batch-report-view-div-17">
            <Button variant="secondary" size="sm" icon={X} onClick={cancelFilters} data-cy="batch-report-view-button-cancel-filters">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={applyFilters} data-cy="batch-report-view-button-apply-filters">
              Filter
            </Button>
            <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint} data-cy="batch-report-view-button-print">
              Print
            </Button>
          </div>
        </div>
        <div className="flex items-start gap-1.5 text-[11px] text-neutral-400" data-cy="batch-report-view-div-date-range-filters-batches-by-their">
          <Info size={12} className="mt-0.5 shrink-0" data-cy="batch-report-view-info-22" />
          Date range filters batches by their start date.
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between no-print" data-cy="batch-report-view-div-23">
        <span className="text-xs text-neutral-500" data-cy="batch-report-view-span-batch">
          {batches.length} batch{batches.length === 1 ? '' : 'es'} &middot; {dateRangeLabel}
        </span>
        <div className="flex gap-2" data-cy="batch-report-view-div-25">
          <button onClick={expandAll} className="text-xs font-medium text-brand-600 hover:underline" data-cy="batch-report-view-button-expand-all">
            Expand all
          </button>
          <span className="text-xs text-neutral-300" data-cy="batch-report-view-span-27">|</span>
          <button onClick={collapseAll} className="text-xs font-medium text-brand-600 hover:underline" data-cy="batch-report-view-button-collapse-all">
            Collapse all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 no-print" data-cy="batch-report-view-div-29">
        {batches.map(batch => {
        const list = batch.trainees;
        const fin = batch.financials;
        const activities = batch.activities ?? [];
        const isOpen = expanded.has(batch.batchNo);
        return <div key={batch.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white" data-cy="batch-report-view-div-30">
              <button onClick={() => toggleExpand(batch.batchNo)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-3.5 text-left transition-colors hover:bg-neutral-50" data-cy="batch-report-view-button-toggle-expand">
                {isOpen ? <ChevronDown size={16} className="shrink-0 text-neutral-400" data-cy="batch-report-view-chevron-down-32" /> : <ChevronRight size={16} className="shrink-0 text-neutral-400" data-cy="batch-report-view-chevron-right-33" />}
                <div className="min-w-[140px]" data-cy="batch-report-view-div-34">
                  <div className="font-mono text-xs font-semibold text-ink" data-cy="batch-report-view-div-35">{batch.batchNo}</div>
                  <div className="text-xs text-neutral-500" data-cy="batch-report-view-div-36">{batch.programType}</div>
                </div>
                <StatusBadge status={batch.status} data-cy="batch-report-view-status-badge-37" />
                <div className="text-xs text-neutral-500" data-cy="batch-report-view-div-38">{batch.industry} &middot; {batch.setup}</div>
                <div className="text-xs text-neutral-500" data-cy="batch-report-view-div-39">
                  {batch.started} &ndash; {batch.projectedEnd}
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-600" data-cy="batch-report-view-div-activities-completed">
                  <ClipboardList size={13} className="text-neutral-400" data-cy="batch-report-view-clipboard-list-41" /> {activities.length} activities completed
                </div>
                <div className="ml-auto flex gap-5 text-right" data-cy="batch-report-view-div-42">
                  <div data-cy="batch-report-view-div-43">
                    <div className="text-[10px] text-neutral-400" data-cy="batch-report-view-div-received">Received</div>
                    <div className="text-xs font-semibold text-ink" data-cy="batch-report-view-div-45">{formatCurrency(fin.totalReceived)}</div>
                  </div>
                  <div data-cy="batch-report-view-div-46">
                    <div className="text-[10px] text-neutral-400" data-cy="batch-report-view-div-balance">Balance</div>
                    <div className={cn('text-xs font-semibold', fin.totalBalance > 0 ? 'text-warning-700' : 'text-ink')} data-cy="batch-report-view-div-48">
                      {formatCurrency(fin.totalBalance)}
                    </div>
                  </div>
                </div>
              </button>

              {isOpen && <div className="border-t border-neutral-100 p-4" data-cy="batch-report-view-div-49">
                  <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-md bg-neutral-50 p-3 text-xs sm:grid-cols-4" data-cy="batch-report-view-div-50">
                    <div data-cy="batch-report-view-div-51">
                      <div className="text-[10px] text-neutral-400" data-cy="batch-report-view-div-trainees">Trainees</div>
                      <div className="font-semibold text-ink" data-cy="batch-report-view-div-53">{list.length}</div>
                    </div>
                    <div data-cy="batch-report-view-div-54">
                      <div className="text-[10px] text-neutral-400" data-cy="batch-report-view-div-created">Created</div>
                      <div className="font-semibold text-ink" data-cy="batch-report-view-div-56">{batch.createdDate}</div>
                    </div>
                    <div data-cy="batch-report-view-div-57">
                      <div className="text-[10px] text-neutral-400" data-cy="batch-report-view-div-total-received">Total received</div>
                      <div className="font-semibold text-success-700" data-cy="batch-report-view-div-59">{formatCurrency(fin.totalReceived)}</div>
                    </div>
                    <div data-cy="batch-report-view-div-60">
                      <div className="text-[10px] text-neutral-400" data-cy="batch-report-view-div-total-balance">Total balance</div>
                      <div className={cn('font-semibold', fin.totalBalance > 0 ? 'text-warning-700' : 'text-ink')} data-cy="batch-report-view-div-62">
                        {formatCurrency(fin.totalBalance)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink" data-cy="batch-report-view-div-completed-activities">
                    <Wallet size={13} className="text-neutral-400" data-cy="batch-report-view-wallet-65" /> Completed activities
                  </div>
                  <div className="overflow-x-auto rounded-md border border-neutral-200 lss-scrollbar" data-cy="batch-report-view-div-66">
                    <table className="w-full min-w-[720px] border-collapse text-sm" data-cy="batch-report-view-table-67">
                      <thead data-cy="batch-report-view-thead-68">
                        <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="batch-report-view-tr-69">
                          <th className="px-3 py-2 font-medium" data-cy="batch-report-view-th-task">Task</th>
                          <th className="px-3 py-2 font-medium" data-cy="batch-report-view-th-trainee">Trainee</th>
                          <th className="px-3 py-2 font-medium" data-cy="batch-report-view-th-trainer">Trainer</th>
                          <th className="px-3 py-2 font-medium" data-cy="batch-report-view-th-time-goal">Time goal</th>
                          <th className="px-3 py-2 font-medium" data-cy="batch-report-view-th-time-spent">Time spent</th>
                          <th className="px-3 py-2 font-medium" data-cy="batch-report-view-th-date">Date</th>
                        </tr>
                      </thead>
                      <tbody data-cy="batch-report-view-tbody-76">
                        {activities.map(a => <tr key={a.id} className="border-t border-neutral-100" data-cy="batch-report-view-tr-77">
                            <td className="px-3 py-2 font-medium text-ink" data-cy="batch-report-view-td-78">{a.task}</td>
                            <td className="px-3 py-2 text-neutral-600" data-cy="batch-report-view-td-79">{a.trainee}</td>
                            <td className="px-3 py-2 text-neutral-600" data-cy="batch-report-view-td-80">{a.trainer}</td>
                            <td className="px-3 py-2 font-mono text-xs text-neutral-600" data-cy="batch-report-view-td-h">{a.timeGoal}h</td>
                            <td className="px-3 py-2 font-mono text-xs text-neutral-600" data-cy="batch-report-view-td-h-2">{a.timeSpent}h</td>
                            <td className="px-3 py-2 font-mono text-xs text-neutral-600" data-cy="batch-report-view-td-83">{a.date}</td>
                          </tr>)}
                        {activities.length === 0 && <tr data-cy="batch-report-view-tr-84">
                            <td colSpan={6} className="px-3 py-6 text-center text-xs text-neutral-400" data-cy="batch-report-view-td-no-completed-activities-recorded-for-this">
                              No completed activities recorded for this batch.
                            </td>
                          </tr>}
                      </tbody>
                    </table>
                  </div>
                </div>}
            </div>;
      })}

        {batches.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white px-4 py-10 text-center text-xs text-neutral-400" data-cy="batch-report-view-div-no-batches-match-your-search-or">
            No batches match your search or filters.
          </div>}
      </div>

      <BatchReportPrint batches={batches} generatedAt={printGeneratedAt} dateRangeLabel={dateRangeLabel} data-cy="batch-report-view-batch-report-print-87" />
    </>;
}
