import { useMemo, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, ChevronRight as RowChevron } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { ParticipantDetailModal } from './ParticipantDetailModal';
import { PARTICIPANT_STATUS_ORDER, PARTICIPANT_STATUS_STYLE, MONTH_NAMES, seminarYears } from './seminarUtils';
import type { Seminar, SeminarParticipant } from '@/types';
import { cn } from '@/lib/utils';
const PAGE_SIZE = 8;
interface Props {
  seminars: Seminar[];
  participants: SeminarParticipant[];
  onUpdate: (id: string, patch: Partial<SeminarParticipant>) => void;
  initialTopicFilter?: string;
}
export function ParticipantsTab({
  seminars,
  participants,
  onUpdate,
  initialTopicFilter
}: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState(initialTopicFilter ?? '');
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SeminarParticipant | null>(null);
  const years = useMemo(() => seminarYears(seminars), [seminars]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return participants.filter(p => {
      if (q && !p.name.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
      if (statusFilter && statusFilter !== 'Status' && p.status !== statusFilter) return false;
      if (topicFilter && topicFilter !== 'Seminar topic' && p.seminarTopic !== topicFilter) return false;
      if (p.registeredAt) {
        if (yearFilter && yearFilter !== 'Year' && !p.registeredAt.startsWith(yearFilter)) return false;
        if (monthFilter && monthFilter !== 'Month') {
          const m = MONTH_NAMES.indexOf(monthFilter) + 1;
          if (Number(p.registeredAt.slice(5, 7)) !== m) return false;
        }
        if (from && p.registeredAt < from) return false;
        if (to && p.registeredAt > to) return false;
      }
      return true;
    });
  }, [participants, query, statusFilter, topicFilter, yearFilter, monthFilter, from, to]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasActiveFilters = !!(query || statusFilter || topicFilter || yearFilter || monthFilter || from || to);
  function resetFilters() {
    setQuery('');
    setStatusFilter('');
    setTopicFilter('');
    setYearFilter('');
    setMonthFilter('');
    setFrom('');
    setTo('');
    setPage(1);
  }
  function updateFilter(setter: (v: string) => void, placeholder: string) {
    return (v: string) => {
      setter(v === placeholder ? '' : v);
      setPage(1);
    };
  }
  return <>
      <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center" data-cy="participants-tab-div-1">
        <div className="relative w-full flex-1 sm:min-w-[160px]" data-cy="participants-tab-div-2">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="participants-tab-search-3" />
          <input type="text" value={query} onChange={e => {
          setQuery(e.target.value);
          setPage(1);
        }} placeholder="Search name or email..." className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="participants-tab-input-search-name-or-email" />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap" data-cy="participants-tab-div-5">
          <Dropdown options={['Seminar topic', ...seminars.map(s => s.topic)]} value={topicFilter} placeholder="Seminar topic" onChange={updateFilter(setTopicFilter, 'Seminar topic')} className="sm:w-56" data-cy="participants-tab-dropdown-seminar-topic" />
          <Dropdown options={['Status', ...PARTICIPANT_STATUS_ORDER]} value={statusFilter} placeholder="Status" onChange={updateFilter(setStatusFilter, 'Status')} className="sm:w-40" data-cy="participants-tab-dropdown-status" />
          <Dropdown options={['Year', ...years]} value={yearFilter} placeholder="Year" onChange={updateFilter(setYearFilter, 'Year')} className="sm:w-28" data-cy="participants-tab-dropdown-year" />
          <Dropdown options={['Month', ...MONTH_NAMES]} value={monthFilter} placeholder="Month" onChange={updateFilter(setMonthFilter, 'Month')} className="sm:w-32" data-cy="participants-tab-dropdown-month" />
          <input type="date" value={from} onChange={e => {
          setFrom(e.target.value);
          setPage(1);
        }} title="From date" className="h-9 rounded-md border border-neutral-200 px-2 text-xs text-neutral-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="participants-tab-input-from-date" />
          <input type="date" value={to} onChange={e => {
          setTo(e.target.value);
          setPage(1);
        }} title="To date" className="h-9 rounded-md border border-neutral-200 px-2 text-xs text-neutral-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="participants-tab-input-to-date" />
        </div>
        {hasActiveFilters && <button onClick={resetFilters} className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700" data-cy="participants-tab-button-reset-filters">
            <X size={13} data-cy="participants-tab-x-13" />
            Clear
          </button>}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block" data-cy="participants-tab-div-14">
        <div className="overflow-x-auto lss-scrollbar" data-cy="participants-tab-div-15">
          <table className="w-full min-w-[720px] border-collapse text-sm" data-cy="participants-tab-table-16">
            <thead data-cy="participants-tab-thead-17">
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="participants-tab-tr-18">
                <th className="px-4 py-2.5 font-medium" data-cy="participants-tab-th-status">Status</th>
                <th className="px-4 py-2.5 font-medium" data-cy="participants-tab-th-name">Name</th>
                <th className="px-4 py-2.5 font-medium" data-cy="participants-tab-th-seminar-topic">Seminar topic</th>
                <th className="px-4 py-2.5 font-medium" data-cy="participants-tab-th-email">Email</th>
                <th className="px-4 py-2.5" data-cy="participants-tab-th-23" />
              </tr>
            </thead>
            <tbody data-cy="participants-tab-tbody-24">
              {paged.map(p => <tr key={p.id} onClick={() => setSelected(p)} className="cursor-pointer border-t border-neutral-100 transition-colors hover:bg-neutral-50" data-cy="participants-tab-tr-set-selected">
                  <td className="px-4 py-2.5" data-cy="participants-tab-td-26">
                    <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', PARTICIPANT_STATUS_STYLE[p.status])} data-cy="participants-tab-span-27">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-ink" data-cy="participants-tab-td-28">{p.name}</td>
                  <td className="px-4 py-2.5 text-neutral-600" data-cy="participants-tab-td-29">{p.seminarTopic}</td>
                  <td className="px-4 py-2.5 text-neutral-600" data-cy="participants-tab-td-30">{p.email}</td>
                  <td className="px-4 py-2.5 text-right" data-cy="participants-tab-td-31">
                    <RowChevron size={15} className="ml-auto text-neutral-400" data-cy="participants-tab-row-chevron-32" />
                  </td>
                </tr>)}
              {paged.length === 0 && <tr data-cy="participants-tab-tr-33">
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-500" data-cy="participants-tab-td-no-participants-match-your-search-or">
                    No participants match your search or filters.
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 sm:hidden" data-cy="participants-tab-div-35">
        {paged.map(p => <button key={p.id} onClick={() => setSelected(p)} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3.5 text-left transition-colors active:bg-neutral-50" data-cy="participants-tab-button-set-selected">
            <div className="min-w-0 flex-1" data-cy="participants-tab-div-37">
              <div className="mb-1 flex items-center gap-2" data-cy="participants-tab-div-38">
                <span className="truncate text-sm font-semibold text-ink" data-cy="participants-tab-span-39">{p.name}</span>
                <span className={cn('shrink-0 rounded-pill px-2 py-0.5 text-[11px] font-medium', PARTICIPANT_STATUS_STYLE[p.status])} data-cy="participants-tab-span-40">
                  {p.status}
                </span>
              </div>
              <p className="truncate text-xs text-neutral-500" data-cy="participants-tab-p-41">{p.seminarTopic}</p>
              <p className="truncate text-xs text-neutral-400" data-cy="participants-tab-p-42">{p.email}</p>
            </div>
            <RowChevron size={16} className="ml-2 shrink-0 text-neutral-400" data-cy="participants-tab-row-chevron-43" />
          </button>)}
        {paged.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500" data-cy="participants-tab-div-no-participants-match-your-search-or">
            No participants match your search or filters.
          </div>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500" data-cy="participants-tab-div-45">
        <span data-cy="participants-tab-span-showing">
          Showing {paged.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{(currentPage - 1) * PAGE_SIZE + paged.length} of{' '}
          {filtered.length} participants
        </span>
        <div className="flex gap-1.5" data-cy="participants-tab-div-47">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40" data-cy="participants-tab-button-set-page">
            <ChevronLeft size={14} data-cy="participants-tab-chevron-left-49" />
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40" data-cy="participants-tab-button-set-page-2">
            <ChevronRight size={14} data-cy="participants-tab-chevron-right-51" />
          </button>
        </div>
      </div>

      <ParticipantDetailModal open={!!selected} onClose={() => setSelected(null)} participant={selected} onUpdate={onUpdate} data-cy="participants-tab-participant-detail-modal-set-selected" />
    </>;
}