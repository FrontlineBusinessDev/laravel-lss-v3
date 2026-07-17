import { useMemo, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Copy, Eye, Pencil, CheckCircle2, Lock, Ban, Users } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { RowMenu } from '@/components/RowMenu';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { SEMINAR_STATUS_STYLE, SEMINAR_STATUS_LABEL, formatDate } from './seminarUtils';
import type { Seminar } from '@/types';
import { cn } from '@/lib/utils';
const PAGE_SIZE = 8;
type StatusTransition = 'completed' | 'closed' | 'dissolved';
interface Props {
  seminars: Seminar[];
  onView: (s: Seminar) => void;
  onEdit: (s: Seminar) => void;
  onChangeStatus: (id: string, status: Seminar['status']) => void;
}
export function SeminarListTab({
  seminars,
  onView,
  onEdit,
  onChangeStatus
}: Props) {
  const {
    showToast
  } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{
    seminar: Seminar;
    to: StatusTransition;
  } | null>(null);
  const types = useMemo(() => Array.from(new Set(seminars.map(s => s.type))), [seminars]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return seminars.filter(s => {
      if (q && !s.topic.toLowerCase().includes(q)) return false;
      if (statusFilter && statusFilter !== 'Status' && SEMINAR_STATUS_LABEL[s.status] !== statusFilter) return false;
      if (typeFilter && typeFilter !== 'Track' && s.type !== typeFilter) return false;
      return true;
    });
  }, [seminars, query, statusFilter, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasActiveFilters = !!(query || statusFilter || typeFilter);
  function updateFilter(setter: (v: string) => void, placeholder: string) {
    return (v: string) => {
      setter(v === placeholder ? '' : v);
      setPage(1);
    };
  }
  function resetFilters() {
    setQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
  }
  function copyLink(s: Seminar) {
    navigator.clipboard?.writeText(s.registrationLink).catch(() => {});
    showToast('Registration link copied to clipboard.', 'success');
  }
  const TRANSITION_LABEL: Record<StatusTransition, string> = {
    completed: 'Mark this seminar as Completed',
    closed: 'Close registration for this seminar',
    dissolved: 'Dissolve this seminar'
  };
  function confirmTransition() {
    if (!confirm) return;
    onChangeStatus(confirm.seminar.id, confirm.to);
    showToast(`"${confirm.seminar.topic}" is now ${SEMINAR_STATUS_LABEL[confirm.to]}.`, 'success');
    setConfirm(null);
  }
  function rowActions(s: Seminar) {
    const actions = [{
      label: 'View seminar',
      icon: Eye,
      onClick: () => onView(s)
    }, {
      label: 'Edit seminar',
      icon: Pencil,
      onClick: () => onEdit(s),
      disabled: s.status !== 'active'
    }, {
      label: 'Copy registration link',
      icon: Copy,
      onClick: () => copyLink(s)
    }];
    if (s.status === 'active') {
      actions.push({
        label: 'Mark as completed',
        icon: CheckCircle2,
        onClick: () => setConfirm({
          seminar: s,
          to: 'completed'
        })
      }, {
        label: 'Close registration',
        icon: Lock,
        onClick: () => setConfirm({
          seminar: s,
          to: 'closed'
        })
      }, {
        label: 'Dissolve seminar',
        icon: Ban,
        onClick: () => setConfirm({
          seminar: s,
          to: 'dissolved'
        }),
        danger: true
      } as any);
    }
    return actions;
  }
  return <>
      <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center" data-cy="seminar-list-tab-div-1">
        <div className="relative w-full flex-1 sm:min-w-[160px]" data-cy="seminar-list-tab-div-2">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="seminar-list-tab-search-3" />
          <input type="text" value={query} onChange={e => {
          setQuery(e.target.value);
          setPage(1);
        }} placeholder="Search seminar topic..." className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="seminar-list-tab-input-search-seminar-topic" />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap" data-cy="seminar-list-tab-div-5">
          <Dropdown options={['Status', ...Object.values(SEMINAR_STATUS_LABEL)]} value={statusFilter} placeholder="Status" onChange={updateFilter(setStatusFilter, 'Status')} className="sm:w-32" data-cy="seminar-list-tab-dropdown-status" />
          <Dropdown options={['Track', ...types]} value={typeFilter} placeholder="Track" onChange={updateFilter(setTypeFilter, 'Track')} className="sm:w-56" data-cy="seminar-list-tab-dropdown-track" />
        </div>
        {hasActiveFilters && <button onClick={resetFilters} className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700" data-cy="seminar-list-tab-button-reset-filters">
            <X size={13} data-cy="seminar-list-tab-x-9" />
            Clear
          </button>}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block" data-cy="seminar-list-tab-div-10">
        <div className="overflow-x-auto lss-scrollbar" data-cy="seminar-list-tab-div-11">
          <table className="w-full min-w-[820px] border-collapse text-sm" data-cy="seminar-list-tab-table-12">
            <thead data-cy="seminar-list-tab-thead-13">
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="seminar-list-tab-tr-14">
                <th className="px-4 py-2.5 font-medium" data-cy="seminar-list-tab-th-status">Status</th>
                <th className="px-4 py-2.5 font-medium" data-cy="seminar-list-tab-th-topic">Topic</th>
                <th className="px-4 py-2.5 font-medium" data-cy="seminar-list-tab-th-date">Date</th>
                <th className="px-4 py-2.5 font-medium" data-cy="seminar-list-tab-th-participants">Participants</th>
                <th className="px-4 py-2.5 font-medium" data-cy="seminar-list-tab-th-registration-link">Registration link</th>
                <th className="px-4 py-2.5" data-cy="seminar-list-tab-th-20" />
              </tr>
            </thead>
            <tbody data-cy="seminar-list-tab-tbody-21">
              {paged.map(s => <tr key={s.id} className="border-t border-neutral-100 transition-colors hover:bg-neutral-50" data-cy="seminar-list-tab-tr-22">
                  <td className="px-4 py-2.5" data-cy="seminar-list-tab-td-23">
                    <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium capitalize', SEMINAR_STATUS_STYLE[s.status])} data-cy="seminar-list-tab-span-24">
                      {SEMINAR_STATUS_LABEL[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5" data-cy="seminar-list-tab-td-25">
                    <button onClick={() => onView(s)} className="text-left font-medium text-ink hover:text-brand-600" data-cy="seminar-list-tab-button-view">
                      {s.topic}
                    </button>
                    <div className="text-xs text-neutral-500" data-cy="seminar-list-tab-div-27">{s.venue}</div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-xs text-neutral-600" data-cy="seminar-list-tab-td-28">{formatDate(s.date)}</td>
                  <td className="px-4 py-2.5 text-neutral-600" data-cy="seminar-list-tab-td-29">
                    {s.registeredCount}
                    {s.maxParticipants ? ` / ${s.maxParticipants}` : ''}
                  </td>
                  <td className="px-4 py-2.5" data-cy="seminar-list-tab-td-30">
                    <button onClick={() => copyLink(s)} className="flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600" data-cy="seminar-list-tab-button-copy-link">
                      <Copy size={12} data-cy="seminar-list-tab-copy-32" /> Copy link
                    </button>
                  </td>
                  <td className="px-2 py-2.5 text-right" data-cy="seminar-list-tab-td-33">
                    <RowMenu actions={rowActions(s)} data-cy="seminar-list-tab-row-menu-34" />
                  </td>
                </tr>)}
              {paged.length === 0 && <tr data-cy="seminar-list-tab-tr-35">
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-500" data-cy="seminar-list-tab-td-no-seminars-match-your-search-or">
                    No seminars match your search or filters.
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 sm:hidden" data-cy="seminar-list-tab-div-37">
        {paged.map(s => <div key={s.id} className="rounded-lg border border-neutral-200 bg-white p-3.5" data-cy="seminar-list-tab-div-38">
            <div className="flex items-start justify-between gap-2" data-cy="seminar-list-tab-div-39">
              <button onClick={() => onView(s)} className="min-w-0 flex-1 text-left" data-cy="seminar-list-tab-button-view-2">
                <div className="mb-1 flex items-center gap-2" data-cy="seminar-list-tab-div-41">
                  <span className={cn('shrink-0 rounded-pill px-2 py-0.5 text-[11px] font-medium capitalize', SEMINAR_STATUS_STYLE[s.status])} data-cy="seminar-list-tab-span-42">
                    {SEMINAR_STATUS_LABEL[s.status]}
                  </span>
                </div>
                <p className="truncate text-sm font-semibold text-ink" data-cy="seminar-list-tab-p-43">{s.topic}</p>
                <p className="truncate text-xs text-neutral-500" data-cy="seminar-list-tab-p-44">{s.venue} · {formatDate(s.date)}</p>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500" data-cy="seminar-list-tab-div-registered">
                  <Users size={12} data-cy="seminar-list-tab-users-46" />
                  {s.registeredCount}
                  {s.maxParticipants ? ` / ${s.maxParticipants}` : ''} registered
                </div>
              </button>
              <RowMenu actions={rowActions(s)} data-cy="seminar-list-tab-row-menu-47" />
            </div>
          </div>)}
        {paged.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500" data-cy="seminar-list-tab-div-no-seminars-match-your-search-or">
            No seminars match your search or filters.
          </div>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500" data-cy="seminar-list-tab-div-49">
        <span data-cy="seminar-list-tab-span-showing">
          Showing {paged.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{(currentPage - 1) * PAGE_SIZE + paged.length} of{' '}
          {filtered.length} seminars
        </span>
        <div className="flex gap-1.5" data-cy="seminar-list-tab-div-51">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40" data-cy="seminar-list-tab-button-set-page">
            <ChevronLeft size={14} data-cy="seminar-list-tab-chevron-left-53" />
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40" data-cy="seminar-list-tab-button-set-page-2">
            <ChevronRight size={14} data-cy="seminar-list-tab-chevron-right-55" />
          </button>
        </div>
      </div>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirmTransition} title="Change seminar status" description={confirm ? `${TRANSITION_LABEL[confirm.to]} — "${confirm.seminar.topic}". This cannot be undone.` : ''} tone={confirm?.to === 'dissolved' ? 'danger' : 'default'} confirmLabel={confirm ? SEMINAR_STATUS_LABEL[confirm.to] : 'Confirm'} data-cy="seminar-list-tab-confirm-dialog-change-seminar-status" />
    </>;
}