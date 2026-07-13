import { useMemo, useState } from 'react'
import { Search, Archive, ArchiveRestore, Trash2, Lock, Star, ClipboardList, X } from 'lucide-react'
import { Dropdown } from '@/components/Dropdown'
import { RowMenu } from '@/components/RowMenu'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { StatusBadge } from '@/components/StatusBadge'
import { useToast } from '@/components/Toast'
import type { EvaluationResponse } from '@/types'
import { cn } from '@/lib/utils'

type PendingAction = { type: 'archive' | 'restore' | 'delete'; record: EvaluationResponse } | null

export function EvaluationRecordsPanel({
  responses,
  onChange,
  batchOptions,
}: {
  responses: EvaluationResponse[]
  onChange: (next: EvaluationResponse[]) => void
  batchOptions: string[]
}) {
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [batchFilter, setBatchFilter] = useState('All batches')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [pending, setPending] = useState<PendingAction>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return responses
      .filter((r) => categoryFilter === 'All categories' || r.category === categoryFilter)
      .filter((r) => batchFilter === 'All batches' || r.batchNo === batchFilter)
      .filter((r) => statusFilter === 'All statuses' || r.status === statusFilter.toLowerCase())
      .filter(
        (r) =>
          !q ||
          r.respondentName.toLowerCase().includes(q) ||
          r.targetName.toLowerCase().includes(q) ||
          (r.batchNo ?? '').toLowerCase().includes(q) ||
          (r.seminarTopic ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
  }, [responses, query, categoryFilter, batchFilter, statusFilter])

  const hasActiveFilters = !!(query || categoryFilter !== 'All categories' || batchFilter !== 'All batches' || statusFilter !== 'All statuses')

  function resetFilters() {
    setQuery('')
    setCategoryFilter('All categories')
    setBatchFilter('All batches')
    setStatusFilter('All statuses')
  }

  function runConfirmed() {
    if (!pending) return
    const { type, record } = pending
    if (type === 'archive') {
      onChange(responses.map((r) => (r.id === record.id ? { ...r, status: 'archived' } : r)))
      showToast('Evaluation record archived.', 'success')
    } else if (type === 'restore') {
      onChange(responses.map((r) => (r.id === record.id ? { ...r, status: 'active' } : r)))
      showToast('Evaluation record restored.', 'success')
    } else if (type === 'delete') {
      onChange(responses.filter((r) => r.id !== record.id))
      showToast('Evaluation record permanently deleted.', 'error')
    }
    setPending(null)
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Evaluation records</h2>
          <p className="text-xs text-neutral-500">Search, filter, archive, or delete individual evaluation submissions</p>
        </div>
        <span className="text-xs text-neutral-400">{filtered.length} of {responses.length}</span>
      </div>

      <div className="flex flex-col gap-2 border-b border-neutral-100 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full flex-1 sm:min-w-[180px]">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search respondent, target, batch..."
            className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto">
          <Dropdown options={['All categories', 'Trainer', 'Seminar']} value={categoryFilter} onChange={setCategoryFilter} className="sm:w-36" />
          <Dropdown options={['All batches', ...batchOptions]} value={batchFilter} onChange={setBatchFilter} className="sm:w-36" />
          <Dropdown options={['All statuses', 'Active', 'Archived']} value={statusFilter} onChange={setStatusFilter} className="sm:w-32" />
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block lss-scrollbar">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
              <th className="px-4 py-2.5 font-medium">Respondent</th>
              <th className="px-4 py-2.5 font-medium">Evaluated</th>
              <th className="px-4 py-2.5 font-medium">Scope</th>
              <th className="px-4 py-2.5 font-medium">Score</th>
              <th className="px-4 py-2.5 font-medium">Submitted</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 text-ink">{r.respondentName}</td>
                <td className="px-4 py-3 text-ink">{r.targetName}</td>
                <td className="px-4 py-3 text-neutral-500">
                  <span className="rounded-sm bg-neutral-100 px-2 py-0.5 text-xs">{r.category}</span>{' '}
                  <span className="font-mono text-xs">{r.batchNo ?? r.seminarTopic}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 font-medium text-ink">
                    {r.averageScore.toFixed(1)} <Star size={11} className="fill-warning-400 text-warning-400" />
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(r.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={r.status} />
                    {r.critical && (
                      <span title="Critical record — protected from deletion">
                        <Lock size={12} className="text-warning-600" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <RowMenu
                    actions={[
                      r.status === 'archived'
                        ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setPending({ type: 'restore', record: r }) }
                        : { label: 'Archive', icon: Archive, onClick: () => setPending({ type: 'archive', record: r }) },
                      {
                        label: r.critical ? 'Delete (protected)' : 'Delete',
                        icon: r.critical ? Lock : Trash2,
                        danger: !r.critical,
                        disabled: r.critical,
                        onClick: () => setPending({ type: 'delete', record: r }),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-500">
                  <ClipboardList size={20} className="mx-auto mb-2 text-neutral-300" />
                  No evaluation records match your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 p-3 sm:hidden">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-lg border border-neutral-200 p-3.5">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">{r.respondentName}</span>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={r.status} />
                {r.critical && <Lock size={12} className="text-warning-600" />}
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Evaluated {r.targetName} &middot; {r.category} &middot; {r.batchNo ?? r.seminarTopic}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-xs text-neutral-500">
              <span className="flex items-center gap-1 font-medium text-ink">
                {r.averageScore.toFixed(1)} <Star size={11} className="fill-warning-400 text-warning-400" />
              </span>
              <span>{new Date(r.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="mt-2 flex justify-end gap-1">
              {r.status === 'archived' ? (
                <button
                  onClick={() => setPending({ type: 'restore', record: r })}
                  className={cn('flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100')}
                >
                  <ArchiveRestore size={12} /> Restore
                </button>
              ) : (
                <button
                  onClick={() => setPending({ type: 'archive', record: r })}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
                >
                  <Archive size={12} /> Archive
                </button>
              )}
              <button
                disabled={r.critical}
                onClick={() => setPending({ type: 'delete', record: r })}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-danger-600 hover:bg-danger-50 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
              >
                {r.critical ? <Lock size={12} /> : <Trash2 size={12} />} {r.critical ? 'Protected' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-400">
            No evaluation records match your search or filters.
          </div>
        )}
      </div>

      {pending && (
        <ConfirmDialog
          open={!!pending}
          onClose={() => setPending(null)}
          onConfirm={runConfirmed}
          title={pending.type === 'archive' ? 'Archive record' : pending.type === 'restore' ? 'Restore record' : 'Delete record'}
          tone={pending.type === 'delete' ? 'danger' : 'default'}
          confirmLabel={pending.type === 'archive' ? 'Archive' : pending.type === 'restore' ? 'Restore' : 'Delete permanently'}
          description={
            pending.type === 'archive'
              ? `This evaluation record for ${pending.record.respondentName} will be moved to archived records. It can be restored later.`
              : pending.type === 'restore'
                ? `This evaluation record for ${pending.record.respondentName} will be restored to active records.`
                : `This permanently deletes the evaluation record for ${pending.record.respondentName} and cannot be undone.`
          }
        />
      )}
    </div>
  )
}
