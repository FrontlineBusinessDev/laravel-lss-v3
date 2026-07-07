import { useMemo, useState } from 'react'
import { useNavigate } from '@/lib/router-compat'
import { Plus, Search, ChevronLeft, ChevronRight, ChevronRight as RowChevron, Users, X } from 'lucide-react'
import { Button } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { Dropdown } from '@/components/Dropdown'
import { CreateBatchModal } from './CreateBatchModal'
import { useBatches } from '@/context/BatchesContext'

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  completed: 'Completed',
  terminated: 'Terminated',
  dissolved: 'Dissolved',
}

const PAGE_SIZE = 8

export default function BatchesListPage() {
  const navigate = useNavigate()
  const { batches } = useBatches()
  const [modalOpen, setModalOpen] = useState(false)

  const [query, setQuery] = useState('')
  const [programTypeFilter, setProgramTypeFilter] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [setupFilter, setSetupFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const programTypes = useMemo(() => Array.from(new Set(batches.map((b) => b.programType))).sort(), [batches])
  const industries = useMemo(() => Array.from(new Set(batches.map((b) => b.industry))).sort(), [batches])
  const setups = useMemo(() => Array.from(new Set(batches.map((b) => b.setup))), [batches])
  const statuses = useMemo(
    () => Array.from(new Set(batches.map((b) => b.status))).map((s) => STATUS_LABELS[s] ?? s),
    [batches],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return batches.filter((b) => {
      if (q && !b.batchNo.toLowerCase().includes(q)) return false
      if (programTypeFilter && programTypeFilter !== 'Program type' && b.programType !== programTypeFilter) return false
      if (industryFilter && industryFilter !== 'Industry' && b.industry !== industryFilter) return false
      if (setupFilter && setupFilter !== 'Setup' && b.setup !== setupFilter) return false
      if (statusFilter && statusFilter !== 'Status' && (STATUS_LABELS[b.status] ?? b.status) !== statusFilter) return false
      return true
    })
  }, [batches, query, programTypeFilter, industryFilter, setupFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasActiveFilters = !!(query || programTypeFilter || industryFilter || setupFilter || statusFilter)

  function resetFilters() {
    setQuery('')
    setProgramTypeFilter('')
    setIndustryFilter('')
    setSetupFilter('')
    setStatusFilter('')
    setPage(1)
  }

  function updateFilter(setter: (v: string) => void, placeholder: string) {
    return (v: string) => {
      setter(v === placeholder ? '' : v)
      setPage(1)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Batches</h1>
          <p className="text-sm text-neutral-500">{batches.length} total batches</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
          <span className="hidden sm:inline">Add batch</span>
        </Button>
      </div>

      <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full flex-1 sm:min-w-[160px]">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search batch number..."
            className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <Dropdown
            options={['Program type', ...programTypes]}
            value={programTypeFilter}
            placeholder="Program type"
            onChange={updateFilter(setProgramTypeFilter, 'Program type')}
            className="sm:w-40"
          />
          <Dropdown
            options={['Industry', ...industries]}
            value={industryFilter}
            placeholder="Industry"
            onChange={updateFilter(setIndustryFilter, 'Industry')}
            className="sm:w-36"
          />
          <Dropdown
            options={['Setup', ...setups]}
            value={setupFilter}
            placeholder="Setup"
            onChange={updateFilter(setSetupFilter, 'Setup')}
            className="sm:w-32"
          />
          <Dropdown
            options={['Status', ...statuses]}
            value={statusFilter}
            placeholder="Status"
            onChange={updateFilter(setStatusFilter, 'Status')}
            className="sm:w-32"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block">
        <div className="overflow-x-auto lss-scrollbar">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                <th className="px-4 py-2.5 font-medium">Batch no.</th>
                <th className="px-4 py-2.5 font-medium">Program type</th>
                <th className="px-4 py-2.5 font-medium">Industry</th>
                <th className="px-4 py-2.5 font-medium">Setup</th>
                <th className="px-4 py-2.5 font-medium">Trainees</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {paged.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => navigate(`/batches/${b.id}`)}
                  className="cursor-pointer border-t border-neutral-100 transition-colors hover:bg-neutral-50"
                >
                  <td className="px-4 py-3 font-mono font-medium text-ink">{b.batchNo}</td>
                  <td className="px-4 py-3 text-ink">{b.programType}</td>
                  <td className="px-4 py-3 text-ink">{b.industry}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-sm bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{b.setup}</span>
                  </td>
                  <td className="px-4 py-3 text-ink">{b.trainees}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowChevron size={15} className="ml-auto text-neutral-400" />
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-500">
                    No batches match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-2 sm:hidden">
        {paged.map((b) => (
          <button
            key={b.id}
            onClick={() => navigate(`/batches/${b.id}`)}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3.5 text-left transition-colors active:bg-neutral-50"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-ink">{b.batchNo}</span>
                <StatusBadge status={b.status} />
              </div>
              <p className="truncate text-xs text-neutral-500">
                {b.programType} · {b.industry}
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-neutral-500">
                <span className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600">{b.setup}</span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {b.trainees}
                </span>
              </div>
            </div>
            <RowChevron size={16} className="ml-2 shrink-0 text-neutral-400" />
          </button>
        ))}
        {paged.length === 0 && (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
            No batches match your search or filters.
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <span>
          Showing {paged.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{(currentPage - 1) * PAGE_SIZE + paged.length} of{' '}
          {filtered.length} batches
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <CreateBatchModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
