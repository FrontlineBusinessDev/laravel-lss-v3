import { useMemo, useState } from 'react';
import { Search, Printer, X, ChevronDown, ChevronRight, ClipboardList, Wallet, Info } from 'lucide-react';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { useBatches } from '@/context/BatchesContext';
import { cn } from '@/lib/utils';
import { computeGroupFinancials, getCompletedActivitiesForBatch, formatCurrency } from './reportsUtils';
import { BatchReportPrint } from './BatchReportPrint';
interface BatchFilters {
  dateFrom: string;
  dateTo: string;
  industry: string;
}
const EMPTY_FILTERS: BatchFilters = {
  dateFrom: '',
  dateTo: '',
  industry: 'All industries'
};
export function BatchTab() {
  const {
    batches,
    trainees
  } = useBatches();
  const {
    showToast
  } = useToast();
  const [query, setQuery] = useState('');
  const [draftFilters, setDraftFilters] = useState<BatchFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<BatchFilters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const industryOptions = ['All industries', ...Array.from(new Set(batches.map(b => b.industry))).sort()];
  const traineesByBatch = useMemo(() => {
    const map = new Map<string, typeof trainees>();
    for (const b of batches) {
      map.set(b.batchNo, trainees.filter(t => t.batchNo === b.batchNo && !t.archived));
    }
    return map;
  }, []);
  const filteredBatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return batches.filter(b => {
      if (appliedFilters.dateFrom || appliedFilters.dateTo) {
        const started = new Date(b.started);
        if (appliedFilters.dateFrom && started < new Date(appliedFilters.dateFrom)) return false;
        if (appliedFilters.dateTo && started > new Date(appliedFilters.dateTo)) return false;
      }
      if (appliedFilters.industry !== 'All industries' && b.industry !== appliedFilters.industry) return false;
      if (!q) return true;
      return b.batchNo.toLowerCase().includes(q) || b.programType.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q);
    }).sort((a, b) => a.started < b.started ? 1 : -1);
  }, [query, appliedFilters]);
  const applyFilters = () => setAppliedFilters(draftFilters);
  const cancelFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setQuery('');
  };
  const toggleExpand = (batchNo: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(batchNo)) next.delete(batchNo);else next.add(batchNo);
      return next;
    });
  };
  const expandAll = () => setExpanded(new Set(filteredBatches.map(b => b.batchNo)));
  const collapseAll = () => setExpanded(new Set());
  const dateRangeLabel = appliedFilters.dateFrom || appliedFilters.dateTo ? `${appliedFilters.dateFrom || 'Start'} \u2013 ${appliedFilters.dateTo || 'Present'}` : 'All dates';
  const printGeneratedAt = new Date().toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  function handlePrint() {
    if (filteredBatches.length === 0) {
      showToast('No records to print for the current filters.', 'error');
      return;
    }
    window.print();
  }
  return <>
      <div className="mb-3 flex flex-col gap-2.5 rounded-lg border border-neutral-200 bg-white p-3 no-print" data-cy="batch-tab-div-1">
        <div className="flex flex-wrap items-end gap-2.5" data-cy="batch-tab-div-2">
          <div className="relative w-full flex-1 sm:min-w-[220px]" data-cy="batch-tab-div-3">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="batch-tab-label-search">Search</label>
            <div className="relative" data-cy="batch-tab-div-5">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="batch-tab-search-6" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search batch no., program, or industry..." className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="batch-tab-input-text" />
            </div>
          </div>
          <div data-cy="batch-tab-div-8">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="batch-tab-label-date-from">Date from</label>
            <input type="date" value={draftFilters.dateFrom} onChange={e => setDraftFilters(f => ({
            ...f,
            dateFrom: e.target.value
          }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="batch-tab-input-date" />
          </div>
          <div data-cy="batch-tab-div-11">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="batch-tab-label-date-to">Date to</label>
            <input type="date" value={draftFilters.dateTo} onChange={e => setDraftFilters(f => ({
            ...f,
            dateTo: e.target.value
          }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="batch-tab-input-date-2" />
          </div>
          <div className="w-48" data-cy="batch-tab-div-14">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="batch-tab-label-industry">Industry</label>
            <Dropdown options={industryOptions} value={draftFilters.industry} onChange={v => setDraftFilters(f => ({
            ...f,
            industry: v
          }))} data-cy="batch-tab-dropdown-set-draft-filters" />
          </div>
          <div className="ml-auto flex gap-2" data-cy="batch-tab-div-17">
            <Button variant="secondary" size="sm" icon={X} onClick={cancelFilters} data-cy="batch-tab-button-cancel-filters">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={applyFilters} data-cy="batch-tab-button-apply-filters">
              Filter
            </Button>
            <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint} data-cy="batch-tab-button-print">
              Print
            </Button>
          </div>
        </div>
        <div className="flex items-start gap-1.5 text-[11px] text-neutral-400" data-cy="batch-tab-div-date-range-filters-batches-by-their">
          <Info size={12} className="mt-0.5 shrink-0" data-cy="batch-tab-info-22" />
          Date range filters batches by their start date.
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between no-print" data-cy="batch-tab-div-23">
        <span className="text-xs text-neutral-500" data-cy="batch-tab-span-batch">
          {filteredBatches.length} batch{filteredBatches.length === 1 ? '' : 'es'} &middot; {dateRangeLabel}
        </span>
        <div className="flex gap-2" data-cy="batch-tab-div-25">
          <button onClick={expandAll} className="text-xs font-medium text-brand-600 hover:underline" data-cy="batch-tab-button-expand-all">
            Expand all
          </button>
          <span className="text-xs text-neutral-300" data-cy="batch-tab-span-27">|</span>
          <button onClick={collapseAll} className="text-xs font-medium text-brand-600 hover:underline" data-cy="batch-tab-button-collapse-all">
            Collapse all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 no-print" data-cy="batch-tab-div-29">
        {filteredBatches.map(batch => {
        const list = traineesByBatch.get(batch.batchNo) ?? [];
        const fin = computeGroupFinancials(list);
        const activities = getCompletedActivitiesForBatch(batch.batchNo);
        const isOpen = expanded.has(batch.batchNo);
        return <div key={batch.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white" data-cy="batch-tab-div-30">
              <button onClick={() => toggleExpand(batch.batchNo)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-3.5 text-left transition-colors hover:bg-neutral-50" data-cy="batch-tab-button-toggle-expand">
                {isOpen ? <ChevronDown size={16} className="shrink-0 text-neutral-400" data-cy="batch-tab-chevron-down-32" /> : <ChevronRight size={16} className="shrink-0 text-neutral-400" data-cy="batch-tab-chevron-right-33" />}
                <div className="min-w-[140px]" data-cy="batch-tab-div-34">
                  <div className="font-mono text-xs font-semibold text-ink" data-cy="batch-tab-div-35">{batch.batchNo}</div>
                  <div className="text-xs text-neutral-500" data-cy="batch-tab-div-36">{batch.programType}</div>
                </div>
                <StatusBadge status={batch.status} data-cy="batch-tab-status-badge-37" />
                <div className="text-xs text-neutral-500" data-cy="batch-tab-div-38">{batch.industry} &middot; {batch.setup}</div>
                <div className="text-xs text-neutral-500" data-cy="batch-tab-div-39">
                  {batch.started} &ndash; {batch.projectedEnd}
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-600" data-cy="batch-tab-div-activities-completed">
                  <ClipboardList size={13} className="text-neutral-400" data-cy="batch-tab-clipboard-list-41" /> {activities.length} activities completed
                </div>
                <div className="ml-auto flex gap-5 text-right" data-cy="batch-tab-div-42">
                  <div data-cy="batch-tab-div-43">
                    <div className="text-[10px] text-neutral-400" data-cy="batch-tab-div-received">Received</div>
                    <div className="text-xs font-semibold text-ink" data-cy="batch-tab-div-45">{formatCurrency(fin.totalReceived)}</div>
                  </div>
                  <div data-cy="batch-tab-div-46">
                    <div className="text-[10px] text-neutral-400" data-cy="batch-tab-div-balance">Balance</div>
                    <div className={cn('text-xs font-semibold', fin.totalBalance > 0 ? 'text-warning-700' : 'text-ink')} data-cy="batch-tab-div-48">
                      {formatCurrency(fin.totalBalance)}
                    </div>
                  </div>
                </div>
              </button>

              {isOpen && <div className="border-t border-neutral-100 p-4" data-cy="batch-tab-div-49">
                  <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-md bg-neutral-50 p-3 text-xs sm:grid-cols-4" data-cy="batch-tab-div-50">
                    <div data-cy="batch-tab-div-51">
                      <div className="text-[10px] text-neutral-400" data-cy="batch-tab-div-trainees">Trainees</div>
                      <div className="font-semibold text-ink" data-cy="batch-tab-div-53">{list.length}</div>
                    </div>
                    <div data-cy="batch-tab-div-54">
                      <div className="text-[10px] text-neutral-400" data-cy="batch-tab-div-created">Created</div>
                      <div className="font-semibold text-ink" data-cy="batch-tab-div-56">{batch.createdDate}</div>
                    </div>
                    <div data-cy="batch-tab-div-57">
                      <div className="text-[10px] text-neutral-400" data-cy="batch-tab-div-total-received">Total received</div>
                      <div className="font-semibold text-success-700" data-cy="batch-tab-div-59">{formatCurrency(fin.totalReceived)}</div>
                    </div>
                    <div data-cy="batch-tab-div-60">
                      <div className="text-[10px] text-neutral-400" data-cy="batch-tab-div-total-balance">Total balance</div>
                      <div className={cn('font-semibold', fin.totalBalance > 0 ? 'text-warning-700' : 'text-ink')} data-cy="batch-tab-div-62">
                        {formatCurrency(fin.totalBalance)}
                      </div>
                    </div>
                  </div>

                  {batch.dissolvedRemarks && <div className="mb-4 rounded-md border border-danger-100 bg-danger-50 px-3 py-2 text-xs text-danger-800" data-cy="batch-tab-div-63">
                      {batch.dissolvedRemarks}
                    </div>}

                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink" data-cy="batch-tab-div-completed-activities">
                    <Wallet size={13} className="text-neutral-400" data-cy="batch-tab-wallet-65" /> Completed activities
                  </div>
                  <div className="overflow-x-auto rounded-md border border-neutral-200 lss-scrollbar" data-cy="batch-tab-div-66">
                    <table className="w-full min-w-[720px] border-collapse text-sm" data-cy="batch-tab-table-67">
                      <thead data-cy="batch-tab-thead-68">
                        <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="batch-tab-tr-69">
                          <th className="px-3 py-2 font-medium" data-cy="batch-tab-th-task">Task</th>
                          <th className="px-3 py-2 font-medium" data-cy="batch-tab-th-trainee">Trainee</th>
                          <th className="px-3 py-2 font-medium" data-cy="batch-tab-th-trainer">Trainer</th>
                          <th className="px-3 py-2 font-medium" data-cy="batch-tab-th-time-goal">Time goal</th>
                          <th className="px-3 py-2 font-medium" data-cy="batch-tab-th-time-spent">Time spent</th>
                          <th className="px-3 py-2 font-medium" data-cy="batch-tab-th-date">Date</th>
                        </tr>
                      </thead>
                      <tbody data-cy="batch-tab-tbody-76">
                        {activities.map(a => <tr key={a.id} className="border-t border-neutral-100" data-cy="batch-tab-tr-77">
                            <td className="px-3 py-2 font-medium text-ink" data-cy="batch-tab-td-78">{a.task}</td>
                            <td className="px-3 py-2 text-neutral-600" data-cy="batch-tab-td-79">{a.trainee}</td>
                            <td className="px-3 py-2 text-neutral-600" data-cy="batch-tab-td-80">{a.trainer}</td>
                            <td className="px-3 py-2 font-mono text-xs text-neutral-600" data-cy="batch-tab-td-h">{a.timeGoal}h</td>
                            <td className="px-3 py-2 font-mono text-xs text-neutral-600" data-cy="batch-tab-td-h-2">{a.timeSpent}h</td>
                            <td className="px-3 py-2 font-mono text-xs text-neutral-600" data-cy="batch-tab-td-83">{a.date}</td>
                          </tr>)}
                        {activities.length === 0 && <tr data-cy="batch-tab-tr-84">
                            <td colSpan={6} className="px-3 py-6 text-center text-xs text-neutral-400" data-cy="batch-tab-td-no-completed-activities-recorded-for-this">
                              No completed activities recorded for this batch.
                            </td>
                          </tr>}
                      </tbody>
                    </table>
                  </div>
                </div>}
            </div>;
      })}

        {filteredBatches.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white px-4 py-10 text-center text-xs text-neutral-400" data-cy="batch-tab-div-no-batches-match-your-search-or">
            No batches match your search or filters.
          </div>}
      </div>

      <BatchReportPrint batches={filteredBatches} traineesByBatch={traineesByBatch} generatedAt={printGeneratedAt} dateRangeLabel={dateRangeLabel} data-cy="batch-tab-batch-report-print-87" />
    </>;
}