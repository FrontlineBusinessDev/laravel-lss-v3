import { useMemo, useState } from 'react';
import { Search, Printer, X, ChevronDown, ChevronRight, Users2, Wallet, CheckCircle2, UserX, Layers, Info } from 'lucide-react';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { useBatches } from '@/context/BatchesContext';
import { seminarParticipants } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { computeGroupFinancials, formatCurrency } from './reportsUtils';
import { AnnualReportPrint } from './AnnualReportPrint';
import { computePaymentBreakdown } from '@/data/mockData';
import { seminarEarningsTotal } from '@/pages/seminars/seminarUtils';
interface AnnualFilters {
  dateFrom: string;
  dateTo: string;
}
const EMPTY_FILTERS: AnnualFilters = {
  dateFrom: '',
  dateTo: ''
};
export function AnnualTab() {
  const {
    batches,
    trainees
  } = useBatches();
  const {
    showToast
  } = useToast();
  const [query, setQuery] = useState('');
  const [draftFilters, setDraftFilters] = useState<AnnualFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AnnualFilters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const traineesByBatch = useMemo(() => {
    const map = new Map<string, typeof trainees>();
    for (const b of batches) {
      map.set(b.batchNo, trainees.filter(t => t.batchNo === b.batchNo && !t.archived).sort((a, z) => a.name.localeCompare(z.name)));
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
      if (!q) return true;
      const list = traineesByBatch.get(b.batchNo) ?? [];
      return b.batchNo.toLowerCase().includes(q) || b.programType.toLowerCase().includes(q) || list.some(t => t.name.toLowerCase().includes(q) || t.school.toLowerCase().includes(q));
    }).sort((a, b) => a.started < b.started ? 1 : -1);
  }, [query, appliedFilters, traineesByBatch]);
  const allFilteredTrainees = filteredBatches.flatMap(b => traineesByBatch.get(b.batchNo) ?? []);
  const overall = computeGroupFinancials(allFilteredTrainees);
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
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5 no-print" data-cy="annual-tab-div-1">
        <StatCard label="Batches" value={filteredBatches.length} icon={Layers} data-cy="annual-tab-stat-card-batches" />
        <StatCard label="Trainees" value={overall.traineeCount} icon={Users2} data-cy="annual-tab-stat-card-trainees" />
        <StatCard label="Total received" value={formatCurrency(overall.totalReceived)} icon={Wallet} tone="success" data-cy="annual-tab-stat-card-total-received" />
        <StatCard label="Total balance" value={formatCurrency(overall.totalBalance)} icon={Wallet} tone={overall.totalBalance > 0 ? 'warning' : 'default'} data-cy="annual-tab-stat-card-total-balance" />
        <StatCard label="Seminar revenue" value={formatCurrency(seminarEarningsTotal(seminarParticipants))} icon={Wallet} tone="accent" hint="All-time, tracked separately in Seminars" data-cy="annual-tab-stat-card-seminar-revenue" />
      </div>

      <div className="mb-3 flex flex-col gap-2.5 rounded-lg border border-neutral-200 bg-white p-3 no-print" data-cy="annual-tab-div-7">
        <div className="flex flex-wrap items-end gap-2.5" data-cy="annual-tab-div-8">
          <div className="relative w-full flex-1 sm:min-w-[220px]" data-cy="annual-tab-div-9">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="annual-tab-label-search">Search</label>
            <div className="relative" data-cy="annual-tab-div-11">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="annual-tab-search-12" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search batch, trainee, or school..." className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="annual-tab-input-text" />
            </div>
          </div>
          <div data-cy="annual-tab-div-14">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="annual-tab-label-date-from">Date from</label>
            <input type="date" value={draftFilters.dateFrom} onChange={e => setDraftFilters(f => ({
            ...f,
            dateFrom: e.target.value
          }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="annual-tab-input-date" />
          </div>
          <div data-cy="annual-tab-div-17">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="annual-tab-label-date-to">Date to</label>
            <input type="date" value={draftFilters.dateTo} onChange={e => setDraftFilters(f => ({
            ...f,
            dateTo: e.target.value
          }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="annual-tab-input-date-2" />
          </div>
          <div className="ml-auto flex gap-2" data-cy="annual-tab-div-20">
            <Button variant="secondary" size="sm" icon={X} onClick={cancelFilters} data-cy="annual-tab-button-cancel-filters">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={applyFilters} data-cy="annual-tab-button-apply-filters">
              Filter
            </Button>
            <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint} data-cy="annual-tab-button-print">
              Print
            </Button>
          </div>
        </div>
        <div className="flex items-start gap-1.5 text-[11px] text-neutral-400" data-cy="annual-tab-div-date-range-filters-batches-by-their">
          <Info size={12} className="mt-0.5 shrink-0" data-cy="annual-tab-info-25" />
          Date range filters batches by their start date. Terminated trainees remain in totals below.
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between no-print" data-cy="annual-tab-div-26">
        <span className="text-xs text-neutral-500" data-cy="annual-tab-span-batch">
          {filteredBatches.length} batch{filteredBatches.length === 1 ? '' : 'es'} &middot; {dateRangeLabel}
        </span>
        <div className="flex gap-2" data-cy="annual-tab-div-28">
          <button onClick={expandAll} className="text-xs font-medium text-brand-600 hover:underline" data-cy="annual-tab-button-expand-all">
            Expand all
          </button>
          <span className="text-xs text-neutral-300" data-cy="annual-tab-span-30">|</span>
          <button onClick={collapseAll} className="text-xs font-medium text-brand-600 hover:underline" data-cy="annual-tab-button-collapse-all">
            Collapse all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 no-print" data-cy="annual-tab-div-32">
        {filteredBatches.map(batch => {
        const list = traineesByBatch.get(batch.batchNo) ?? [];
        const fin = computeGroupFinancials(list);
        const isOpen = expanded.has(batch.batchNo);
        return <div key={batch.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white" data-cy="annual-tab-div-33">
              <button onClick={() => toggleExpand(batch.batchNo)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-3.5 text-left transition-colors hover:bg-neutral-50" data-cy="annual-tab-button-toggle-expand">
                {isOpen ? <ChevronDown size={16} className="shrink-0 text-neutral-400" data-cy="annual-tab-chevron-down-35" /> : <ChevronRight size={16} className="shrink-0 text-neutral-400" data-cy="annual-tab-chevron-right-36" />}
                <div className="min-w-[140px]" data-cy="annual-tab-div-37">
                  <div className="font-mono text-xs font-semibold text-ink" data-cy="annual-tab-div-38">{batch.batchNo}</div>
                  <div className="text-xs text-neutral-500" data-cy="annual-tab-div-39">{batch.programType}</div>
                </div>
                <StatusBadge status={batch.status} data-cy="annual-tab-status-badge-40" />
                <div className="text-xs text-neutral-500" data-cy="annual-tab-div-41">
                  {batch.started} &ndash; {batch.projectedEnd}
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-600" data-cy="annual-tab-div-trainee">
                  <Users2 size={13} className="text-neutral-400" data-cy="annual-tab-users2-43" /> {list.length} trainee{list.length === 1 ? '' : 's'}
                </div>
                {fin.completedCount > 0 && <div className="flex items-center gap-1 text-xs text-success-700" data-cy="annual-tab-div-completed">
                    <CheckCircle2 size={13} data-cy="annual-tab-check-circle2-45" /> {fin.completedCount} completed
                  </div>}
                {fin.terminatedCount > 0 && <div className="flex items-center gap-1 text-xs text-danger-700" data-cy="annual-tab-div-terminated">
                    <UserX size={13} data-cy="annual-tab-user-x-47" /> {fin.terminatedCount} terminated
                  </div>}
                <div className="ml-auto flex gap-5 text-right" data-cy="annual-tab-div-48">
                  <div data-cy="annual-tab-div-49">
                    <div className="text-[10px] text-neutral-400" data-cy="annual-tab-div-received">Received</div>
                    <div className="text-xs font-semibold text-ink" data-cy="annual-tab-div-51">{formatCurrency(fin.totalReceived)}</div>
                  </div>
                  <div data-cy="annual-tab-div-52">
                    <div className="text-[10px] text-neutral-400" data-cy="annual-tab-div-balance">Balance</div>
                    <div className={cn('text-xs font-semibold', fin.totalBalance > 0 ? 'text-warning-700' : 'text-ink')} data-cy="annual-tab-div-54">
                      {formatCurrency(fin.totalBalance)}
                    </div>
                  </div>
                </div>
              </button>

              {isOpen && <div className="overflow-x-auto border-t border-neutral-100 lss-scrollbar" data-cy="annual-tab-div-55">
                  <table className="w-full min-w-[720px] border-collapse text-sm" data-cy="annual-tab-table-56">
                    <thead data-cy="annual-tab-thead-57">
                      <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="annual-tab-tr-58">
                        <th className="px-4 py-2 font-medium" data-cy="annual-tab-th-trainee">Trainee</th>
                        <th className="px-4 py-2 font-medium" data-cy="annual-tab-th-school">School</th>
                        <th className="px-4 py-2 font-medium" data-cy="annual-tab-th-hours">Hours</th>
                        <th className="px-4 py-2 font-medium" data-cy="annual-tab-th-status">Status</th>
                        <th className="px-4 py-2 font-medium" data-cy="annual-tab-th-received">Received</th>
                        <th className="px-4 py-2 font-medium" data-cy="annual-tab-th-balance">Balance</th>
                      </tr>
                    </thead>
                    <tbody data-cy="annual-tab-tbody-65">
                      {list.map(t => {
                  const b = computePaymentBreakdown(t);
                  const completedHours = t.completedHrs >= t.requiredHrs;
                  return <tr key={t.id} className="border-t border-neutral-100" data-cy="annual-tab-tr-66">
                            <td className="px-4 py-2 font-medium text-ink" data-cy="annual-tab-td-67">{t.name}</td>
                            <td className="px-4 py-2 text-neutral-600" data-cy="annual-tab-td-68">{t.school}</td>
                            <td className="px-4 py-2 font-mono text-xs text-neutral-600" data-cy="annual-tab-td-69">
                              {t.completedHrs}/{t.requiredHrs}
                              {completedHours && <CheckCircle2 size={12} className="ml-1 inline text-success-600" data-cy="annual-tab-check-circle2-70" />}
                            </td>
                            <td className="px-4 py-2" data-cy="annual-tab-td-71">
                              <StatusBadge status={t.status} data-cy="annual-tab-status-badge-72" />
                            </td>
                            <td className="px-4 py-2 text-neutral-600" data-cy="annual-tab-td-73">{formatCurrency(b.totalAmountPaid)}</td>
                            <td className="px-4 py-2 text-neutral-600" data-cy="annual-tab-td-74">{formatCurrency(Math.max(0, b.outstandingBalance))}</td>
                          </tr>;
                })}
                      {list.length === 0 && <tr data-cy="annual-tab-tr-75">
                          <td colSpan={6} className="px-4 py-6 text-center text-xs text-neutral-400" data-cy="annual-tab-td-no-trainees-in-this-batch">
                            No trainees in this batch.
                          </td>
                        </tr>}
                    </tbody>
                  </table>
                </div>}
            </div>;
      })}

        {filteredBatches.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white px-4 py-10 text-center text-xs text-neutral-400" data-cy="annual-tab-div-no-batches-match-your-search-or">
            No batches match your search or filters.
          </div>}
      </div>

      <AnnualReportPrint batches={filteredBatches} traineesByBatch={traineesByBatch} generatedAt={printGeneratedAt} dateRangeLabel={dateRangeLabel} data-cy="annual-tab-annual-report-print-78" />
    </>;
}