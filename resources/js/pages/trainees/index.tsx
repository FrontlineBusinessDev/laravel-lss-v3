import { useMemo, useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { Search, ChevronLeft, ChevronRight, ChevronRight as RowChevron } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { getTraineeBatchStatus } from '@/data/mockData';
import { useBatches } from '@/context/BatchesContext';
import { cn } from '@/lib/utils';
const PAGE_SIZE = 10;
export default function TraineesListPage() {
  const navigate = useNavigate();
  const {
    trainees
  } = useBatches();
  const schools = useMemo(() => Array.from(new Set(trainees.map(t => t.school))).sort(), [trainees]);
  const batchNos = useMemo(() => Array.from(new Set(trainees.map(t => t.batchNo))).sort(), [trainees]);
  const programTypes = useMemo(() => Array.from(new Set(trainees.map(t => t.programType))).sort(), [trainees]);
  const academicLevels = useMemo(() => Array.from(new Set(trainees.map(t => t.academicLevel))).sort(), [trainees]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [programTypeFilter, setProgramTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trainees.filter(t => {
      const displayStatus = getTraineeBatchStatus(t);
      if (q) {
        const haystack = [t.name, t.batchNo, t.school, t.academicProgram, t.academicLevel, t.email].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (statusFilter && statusFilter !== 'Status' && displayStatus !== statusFilter) return false;
      if (batchFilter && batchFilter !== 'Batch' && t.batchNo !== batchFilter) return false;
      if (schoolFilter && schoolFilter !== 'School' && t.school !== schoolFilter) return false;
      if (programTypeFilter && programTypeFilter !== 'Program type' && t.programType !== programTypeFilter) return false;
      if (levelFilter && levelFilter !== 'Academic level' && t.academicLevel !== levelFilter) return false;
      return true;
    });
  }, [trainees, query, statusFilter, batchFilter, schoolFilter, programTypeFilter, levelFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  function updateFilter(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setPage(1);
    };
  }
  return <div data-cy="index-div-1">
      <div className="mb-4 flex items-center justify-between" data-cy="index-div-2">
        <div data-cy="index-div-3">
          <h1 className="text-xl font-semibold text-ink" data-cy="index-h1-trainees">Trainees</h1>
          <p className="text-sm text-neutral-500" data-cy="index-p-total-trainees">{trainees.length} total trainees</p>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center" data-cy="index-div-6">
        <div className="relative w-full flex-1 sm:min-w-[220px]" data-cy="index-div-7">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="index-search-8" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, batch, school, program, level, or email..." className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="index-input-text" />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap" data-cy="index-div-10">
          <Dropdown options={['Status', 'Active', 'Inactive']} placeholder="Status" onChange={updateFilter(setStatusFilter)} className="sm:w-32" data-cy="index-dropdown-status" />
          <Dropdown options={['Batch', ...batchNos]} placeholder="Batch" onChange={updateFilter(setBatchFilter)} className="sm:w-40" data-cy="index-dropdown-batch" />
          <Dropdown options={['School', ...schools]} placeholder="School" onChange={updateFilter(setSchoolFilter)} className="sm:w-40" data-cy="index-dropdown-school" />
          <Dropdown options={['Program type', ...programTypes]} placeholder="Program type" onChange={updateFilter(setProgramTypeFilter)} className="sm:w-40" data-cy="index-dropdown-program-type" />
          <Dropdown options={['Academic level', ...academicLevels]} placeholder="Academic level" onChange={updateFilter(setLevelFilter)} className="sm:w-40" data-cy="index-dropdown-academic-level" />
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block" data-cy="index-div-16">
        <div className="overflow-x-auto lss-scrollbar" data-cy="index-div-17">
          <table className="w-full min-w-[960px] border-collapse text-sm" data-cy="index-table-18">
            <thead data-cy="index-thead-19">
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="index-tr-20">
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-full-name">Full name</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-batch">Batch</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-school">School</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-academic-program">Academic program</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-academic-level">Academic level</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-required-hrs">Required hrs</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-email">Email</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-status">Status</th>
                <th className="px-4 py-2.5" data-cy="index-th-29" />
              </tr>
            </thead>
            <tbody data-cy="index-tbody-30">
              {paged.map(t => {
              const displayStatus = getTraineeBatchStatus(t);
              return <tr key={t.id} onClick={() => navigate(`/trainees/${t.id}`)} className="cursor-pointer border-t border-neutral-100 transition-colors hover:bg-neutral-50" data-cy="index-tr-navigate">
                    <td className="px-4 py-3" data-cy="index-td-32">
                      <div className="flex items-center gap-2.5" data-cy="index-div-33">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700" data-cy="index-div-34">
                          {t.initials}
                        </div>
                        <span className="font-medium text-ink" data-cy="index-span-35">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-600" data-cy="index-td-36">{t.batchNo}</td>
                    <td className="px-4 py-3 text-neutral-600" data-cy="index-td-37">{t.school}</td>
                    <td className="px-4 py-3 text-neutral-600" data-cy="index-td-38">{t.academicProgram}</td>
                    <td className="px-4 py-3 text-neutral-600" data-cy="index-td-39">{t.academicLevel}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-600" data-cy="index-td-hrs">{t.requiredHrs} hrs</td>
                    <td className="px-4 py-3 text-neutral-600" data-cy="index-td-41">{t.email}</td>
                    <td className="px-4 py-3" data-cy="index-td-42">
                      <span className={displayStatus === 'Active' ? 'inline-flex items-center rounded-pill bg-success-50 px-2.5 py-0.5 text-xs font-medium leading-5 text-success-800' : 'inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs font-medium leading-5 text-neutral-600'} data-cy="index-span-43">
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" data-cy="index-td-44">
                      <RowChevron size={15} className="ml-auto text-neutral-400" data-cy="index-row-chevron-45" />
                    </td>
                  </tr>;
            })}
              {paged.length === 0 && <tr data-cy="index-tr-46">
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-neutral-500" data-cy="index-td-no-trainees-match-your-search-or">
                    No trainees match your search or filters.
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 sm:hidden" data-cy="index-div-48">
        {paged.map(t => {
        const displayStatus = getTraineeBatchStatus(t);
        return <button key={t.id} onClick={() => navigate(`/trainees/${t.id}`)} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3.5 text-left transition-colors active:bg-neutral-50" data-cy="index-button-navigate">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700" data-cy="index-div-50">
                {t.initials}
              </div>
              <div className="min-w-0 flex-1" data-cy="index-div-51">
                <div className="mb-0.5 flex items-center gap-2" data-cy="index-div-52">
                  <span className="truncate text-sm font-semibold text-ink" data-cy="index-span-53">{t.name}</span>
                  <span className={cn('shrink-0 rounded-pill px-2 py-0.5 text-[11px] font-medium', displayStatus === 'Active' ? 'bg-success-50 text-success-800' : 'bg-neutral-100 text-neutral-600')} data-cy="index-span-54">
                    {displayStatus}
                  </span>
                </div>
                <p className="truncate text-xs text-neutral-500" data-cy="index-p-55">
                  {t.batchNo} · {t.school}
                </p>
                <p className="truncate text-xs text-neutral-400" data-cy="index-p-56">
                  {t.academicProgram} · {t.requiredHrs} hrs
                </p>
              </div>
              <RowChevron size={16} className="shrink-0 text-neutral-400" data-cy="index-row-chevron-57" />
            </button>;
      })}
        {paged.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500" data-cy="index-div-no-trainees-match-your-search-or">
            No trainees match your search or filters.
          </div>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500" data-cy="index-div-59">
        <span data-cy="index-span-showing">
          Showing {paged.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{(currentPage - 1) * PAGE_SIZE + paged.length} of{' '}
          {filtered.length} trainees
        </span>
        <div className="flex gap-1.5" data-cy="index-div-61">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40" data-cy="index-button-set-page">
            <ChevronLeft size={14} data-cy="index-chevron-left-63" />
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40" data-cy="index-button-set-page-2">
            <ChevronRight size={14} data-cy="index-chevron-right-65" />
          </button>
        </div>
      </div>
    </div>;
}