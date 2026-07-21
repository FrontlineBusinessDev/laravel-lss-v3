import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Printer, X, ChevronDown, ChevronRight, Users2, Wallet, CheckCircle2, UserX, Layers, Info } from 'lucide-react';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';
import { reportService } from '@/api-service-layer/developer/report';
import { formatCurrency } from '../reportsUtils';
import { AnnualReportPrint } from './AnnualReportPrint';

interface AnnualFilters {
  dateFrom: string;
  dateTo: string;
}
const EMPTY_FILTERS: AnnualFilters = { dateFrom: '', dateTo: '' };

export default function AnnualReportView() {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [draftFilters, setDraftFilters] = useState<AnnualFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AnnualFilters>(EMPTY_FILTERS);
  const [appliedQuery, setAppliedQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data } = useQuery({
    queryKey: ['reports-annual', appliedQuery, appliedFilters],
    queryFn: () =>
      reportService.annualSummary({
        search: appliedQuery || undefined,
        date_from: appliedFilters.dateFrom || undefined,
        date_to: appliedFilters.dateTo || undefined,
      }),
  });

  const batches = data?.batches ?? [];
  const seminarRevenue = data?.seminarRevenue ?? 0;
  const overall = useMemo(() => {
    let totalReceived = 0;
    let totalBalance = 0;
    let traineeCount = 0;
    let completedCount = 0;
    let terminatedCount = 0;
    for (const b of batches) {
      totalReceived += b.financials.totalReceived;
      totalBalance += b.financials.totalBalance;
      traineeCount += b.financials.traineeCount;
      completedCount += b.financials.completedCount;
      terminatedCount += b.financials.terminatedCount;
    }
    return { totalReceived, totalBalance, traineeCount, completedCount, terminatedCount };
  }, [batches]);

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
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5 no-print" data-cy="annual-report-view-div-1">
        <StatCard label="Batches" value={batches.length} icon={Layers} data-cy="annual-report-view-stat-card-batches" />
        <StatCard label="Trainees" value={overall.traineeCount} icon={Users2} data-cy="annual-report-view-stat-card-trainees" />
        <StatCard label="Total received" value={formatCurrency(overall.totalReceived)} icon={Wallet} tone="success" data-cy="annual-report-view-stat-card-total-received" />
        <StatCard label="Total balance" value={formatCurrency(overall.totalBalance)} icon={Wallet} tone={overall.totalBalance > 0 ? 'warning' : 'default'} data-cy="annual-report-view-stat-card-total-balance" />
        <StatCard label="Seminar revenue" value={formatCurrency(seminarRevenue)} icon={Wallet} tone="accent" hint="All-time, tracked separately in Seminars" data-cy="annual-report-view-stat-card-seminar-revenue" />
      </div>

      <div className="mb-3 flex flex-col gap-2.5 rounded-lg border border-neutral-200 bg-white p-3 no-print" data-cy="annual-report-view-div-7">
        <div className="flex flex-wrap items-end gap-2.5" data-cy="annual-report-view-div-8">
          <div className="relative w-full flex-1 sm:min-w-[220px]" data-cy="annual-report-view-div-9">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="annual-report-view-label-search">Search</label>
            <div className="relative" data-cy="annual-report-view-div-11">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="annual-report-view-search-12" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search batch, trainee, or school..." className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="annual-report-view-input-text" />
            </div>
          </div>
          <div data-cy="annual-report-view-div-14">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="annual-report-view-label-date-from">Date from</label>
            <input type="date" value={draftFilters.dateFrom} onChange={e => setDraftFilters(f => ({
            ...f,
            dateFrom: e.target.value
          }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="annual-report-view-input-date" />
          </div>
          <div data-cy="annual-report-view-div-17">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="annual-report-view-label-date-to">Date to</label>
            <input type="date" value={draftFilters.dateTo} onChange={e => setDraftFilters(f => ({
            ...f,
            dateTo: e.target.value
          }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="annual-report-view-input-date-2" />
          </div>
          <div className="ml-auto flex gap-2" data-cy="annual-report-view-div-20">
            <Button variant="secondary" size="sm" icon={X} onClick={cancelFilters} data-cy="annual-report-view-button-cancel-filters">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={applyFilters} data-cy="annual-report-view-button-apply-filters">
              Filter
            </Button>
            <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint} data-cy="annual-report-view-button-print">
              Print
            </Button>
          </div>
        </div>
        <div className="flex items-start gap-1.5 text-[11px] text-neutral-400" data-cy="annual-report-view-div-date-range-filters-batches-by-their">
          <Info size={12} className="mt-0.5 shrink-0" data-cy="annual-report-view-info-25" />
          Date range filters batches by their start date. Terminated trainees remain in totals below.
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between no-print" data-cy="annual-report-view-div-26">
        <span className="text-xs text-neutral-500" data-cy="annual-report-view-span-batch">
          {batches.length} batch{batches.length === 1 ? '' : 'es'} &middot; {dateRangeLabel}
        </span>
        <div className="flex gap-2" data-cy="annual-report-view-div-28">
          <button onClick={expandAll} className="text-xs font-medium text-brand-600 hover:underline" data-cy="annual-report-view-button-expand-all">
            Expand all
          </button>
          <span className="text-xs text-neutral-300" data-cy="annual-report-view-span-30">|</span>
          <button onClick={collapseAll} className="text-xs font-medium text-brand-600 hover:underline" data-cy="annual-report-view-button-collapse-all">
            Collapse all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 no-print" data-cy="annual-report-view-div-32">
        {batches.map(batch => {
        const list = batch.trainees;
        const fin = batch.financials;
        const isOpen = expanded.has(batch.batchNo);
        return <div key={batch.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white" data-cy="annual-report-view-div-33">
              <button onClick={() => toggleExpand(batch.batchNo)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-3.5 text-left transition-colors hover:bg-neutral-50" data-cy="annual-report-view-button-toggle-expand">
                {isOpen ? <ChevronDown size={16} className="shrink-0 text-neutral-400" data-cy="annual-report-view-chevron-down-35" /> : <ChevronRight size={16} className="shrink-0 text-neutral-400" data-cy="annual-report-view-chevron-right-36" />}
                <div className="min-w-[140px]" data-cy="annual-report-view-div-37">
                  <div className="font-mono text-xs font-semibold text-ink" data-cy="annual-report-view-div-38">{batch.batchNo}</div>
                  <div className="text-xs text-neutral-500" data-cy="annual-report-view-div-39">{batch.programType}</div>
                </div>
                <StatusBadge status={batch.status} data-cy="annual-report-view-status-badge-40" />
                <div className="text-xs text-neutral-500" data-cy="annual-report-view-div-41">
                  {batch.started} &ndash; {batch.projectedEnd}
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-600" data-cy="annual-report-view-div-trainee">
                  <Users2 size={13} className="text-neutral-400" data-cy="annual-report-view-users2-43" /> {list.length} trainee{list.length === 1 ? '' : 's'}
                </div>
                {fin.completedCount > 0 && <div className="flex items-center gap-1 text-xs text-success-700" data-cy="annual-report-view-div-completed">
                    <CheckCircle2 size={13} data-cy="annual-report-view-check-circle2-45" /> {fin.completedCount} completed
                  </div>}
                {fin.terminatedCount > 0 && <div className="flex items-center gap-1 text-xs text-danger-700" data-cy="annual-report-view-div-terminated">
                    <UserX size={13} data-cy="annual-report-view-user-x-47" /> {fin.terminatedCount} terminated
                  </div>}
                <div className="ml-auto flex gap-5 text-right" data-cy="annual-report-view-div-48">
                  <div data-cy="annual-report-view-div-49">
                    <div className="text-[10px] text-neutral-400" data-cy="annual-report-view-div-received">Received</div>
                    <div className="text-xs font-semibold text-ink" data-cy="annual-report-view-div-51">{formatCurrency(fin.totalReceived)}</div>
                  </div>
                  <div data-cy="annual-report-view-div-52">
                    <div className="text-[10px] text-neutral-400" data-cy="annual-report-view-div-balance">Balance</div>
                    <div className={cn('text-xs font-semibold', fin.totalBalance > 0 ? 'text-warning-700' : 'text-ink')} data-cy="annual-report-view-div-54">
                      {formatCurrency(fin.totalBalance)}
                    </div>
                  </div>
                </div>
              </button>

              {isOpen && <div className="overflow-x-auto border-t border-neutral-100 lss-scrollbar" data-cy="annual-report-view-div-55">
                  <table className="w-full min-w-[720px] border-collapse text-sm" data-cy="annual-report-view-table-56">
                    <thead data-cy="annual-report-view-thead-57">
                      <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="annual-report-view-tr-58">
                        <th className="px-4 py-2 font-medium" data-cy="annual-report-view-th-trainee">Trainee</th>
                        <th className="px-4 py-2 font-medium" data-cy="annual-report-view-th-school">School</th>
                        <th className="px-4 py-2 font-medium" data-cy="annual-report-view-th-hours">Hours</th>
                        <th className="px-4 py-2 font-medium" data-cy="annual-report-view-th-status">Status</th>
                        <th className="px-4 py-2 font-medium" data-cy="annual-report-view-th-received">Received</th>
                        <th className="px-4 py-2 font-medium" data-cy="annual-report-view-th-balance">Balance</th>
                      </tr>
                    </thead>
                    <tbody data-cy="annual-report-view-tbody-65">
                      {list.map(t => {
                  const completedHours = t.completedHrs >= t.requiredHrs;
                  return <tr key={t.id} className="border-t border-neutral-100" data-cy="annual-report-view-tr-66">
                            <td className="px-4 py-2 font-medium text-ink" data-cy="annual-report-view-td-67">{t.name}</td>
                            <td className="px-4 py-2 text-neutral-600" data-cy="annual-report-view-td-68">{t.school}</td>
                            <td className="px-4 py-2 font-mono text-xs text-neutral-600" data-cy="annual-report-view-td-69">
                              {t.completedHrs}/{t.requiredHrs}
                              {completedHours && <CheckCircle2 size={12} className="ml-1 inline text-success-600" data-cy="annual-report-view-check-circle2-70" />}
                            </td>
                            <td className="px-4 py-2" data-cy="annual-report-view-td-71">
                              <StatusBadge status={t.status} data-cy="annual-report-view-status-badge-72" />
                            </td>
                            <td className="px-4 py-2 text-neutral-600" data-cy="annual-report-view-td-73">{formatCurrency(t.totalAmountPaid)}</td>
                            <td className="px-4 py-2 text-neutral-600" data-cy="annual-report-view-td-74">{formatCurrency(Math.max(0, t.outstandingBalance))}</td>
                          </tr>;
                })}
                      {list.length === 0 && <tr data-cy="annual-report-view-tr-75">
                          <td colSpan={6} className="px-4 py-6 text-center text-xs text-neutral-400" data-cy="annual-report-view-td-no-trainees-in-this-batch">
                            No trainees in this batch.
                          </td>
                        </tr>}
                    </tbody>
                  </table>
                </div>}
            </div>;
      })}

        {batches.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white px-4 py-10 text-center text-xs text-neutral-400" data-cy="annual-report-view-div-no-batches-match-your-search-or">
            No batches match your search or filters.
          </div>}
      </div>

      <AnnualReportPrint batches={batches} generatedAt={printGeneratedAt} dateRangeLabel={dateRangeLabel} data-cy="annual-report-view-annual-report-print-78" />
    </>;
}
