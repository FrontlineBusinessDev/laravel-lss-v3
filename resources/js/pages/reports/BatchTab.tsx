import { useMemo, useState } from 'react'
import { Search, Printer, X, ChevronDown, ChevronRight, ClipboardList, Wallet, Info } from 'lucide-react'
import { Button } from '@/components/Button'
import { Dropdown } from '@/components/Dropdown'
import { StatusBadge } from '@/components/StatusBadge'
import { useToast } from '@/components/Toast'
import { useBatches } from '@/context/BatchesContext'
import { cn } from '@/lib/utils'
import { computeGroupFinancials, getCompletedActivitiesForBatch, formatCurrency } from './reportsUtils'
import { BatchReportPrint } from './BatchReportPrint'

interface BatchFilters {
  dateFrom: string
  dateTo: string
  industry: string
}
const EMPTY_FILTERS: BatchFilters = { dateFrom: '', dateTo: '', industry: 'All industries' }

export function BatchTab() {
  const { batches, trainees } = useBatches()
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [draftFilters, setDraftFilters] = useState<BatchFilters>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<BatchFilters>(EMPTY_FILTERS)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const industryOptions = ['All industries', ...Array.from(new Set(batches.map((b) => b.industry))).sort()]

  const traineesByBatch = useMemo(() => {
    const map = new Map<string, typeof trainees>()
    for (const b of batches) {
      map.set(b.batchNo, trainees.filter((t) => t.batchNo === b.batchNo && !t.archived))
    }
    return map
  }, [])

  const filteredBatches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return batches
      .filter((b) => {
        if (appliedFilters.dateFrom || appliedFilters.dateTo) {
          const started = new Date(b.started)
          if (appliedFilters.dateFrom && started < new Date(appliedFilters.dateFrom)) return false
          if (appliedFilters.dateTo && started > new Date(appliedFilters.dateTo)) return false
        }
        if (appliedFilters.industry !== 'All industries' && b.industry !== appliedFilters.industry) return false
        if (!q) return true
        return b.batchNo.toLowerCase().includes(q) || b.programType.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q)
      })
      .sort((a, b) => (a.started < b.started ? 1 : -1))
  }, [query, appliedFilters])

  const applyFilters = () => setAppliedFilters(draftFilters)
  const cancelFilters = () => {
    setDraftFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setQuery('')
  }

  const toggleExpand = (batchNo: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(batchNo)) next.delete(batchNo)
      else next.add(batchNo)
      return next
    })
  }
  const expandAll = () => setExpanded(new Set(filteredBatches.map((b) => b.batchNo)))
  const collapseAll = () => setExpanded(new Set())

  const dateRangeLabel =
    appliedFilters.dateFrom || appliedFilters.dateTo
      ? `${appliedFilters.dateFrom || 'Start'} \u2013 ${appliedFilters.dateTo || 'Present'}`
      : 'All dates'
  const printGeneratedAt = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })

  function handlePrint() {
    if (filteredBatches.length === 0) {
      showToast('No records to print for the current filters.', 'error')
      return
    }
    window.print()
  }

  return (
    <>
      <div className="mb-3 flex flex-col gap-2.5 rounded-lg border border-neutral-200 bg-white p-3 no-print">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="relative w-full flex-1 sm:min-w-[220px]">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Search</label>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search batch no., program, or industry..."
                className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Date from</label>
            <input
              type="date"
              value={draftFilters.dateFrom}
              onChange={(e) => setDraftFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Date to</label>
            <input
              type="date"
              value={draftFilters.dateTo}
              onChange={(e) => setDraftFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="w-48">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Industry</label>
            <Dropdown options={industryOptions} value={draftFilters.industry} onChange={(v) => setDraftFilters((f) => ({ ...f, industry: v }))} />
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" size="sm" icon={X} onClick={cancelFilters}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={applyFilters}>
              Filter
            </Button>
            <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
              Print
            </Button>
          </div>
        </div>
        <div className="flex items-start gap-1.5 text-[11px] text-neutral-400">
          <Info size={12} className="mt-0.5 shrink-0" />
          Date range filters batches by their start date.
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between no-print">
        <span className="text-xs text-neutral-500">
          {filteredBatches.length} batch{filteredBatches.length === 1 ? '' : 'es'} &middot; {dateRangeLabel}
        </span>
        <div className="flex gap-2">
          <button onClick={expandAll} className="text-xs font-medium text-brand-600 hover:underline">
            Expand all
          </button>
          <span className="text-xs text-neutral-300">|</span>
          <button onClick={collapseAll} className="text-xs font-medium text-brand-600 hover:underline">
            Collapse all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 no-print">
        {filteredBatches.map((batch) => {
          const list = traineesByBatch.get(batch.batchNo) ?? []
          const fin = computeGroupFinancials(list)
          const activities = getCompletedActivitiesForBatch(batch.batchNo)
          const isOpen = expanded.has(batch.batchNo)

          return (
            <div key={batch.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <button
                onClick={() => toggleExpand(batch.batchNo)}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-3.5 text-left transition-colors hover:bg-neutral-50"
              >
                {isOpen ? <ChevronDown size={16} className="shrink-0 text-neutral-400" /> : <ChevronRight size={16} className="shrink-0 text-neutral-400" />}
                <div className="min-w-[140px]">
                  <div className="font-mono text-xs font-semibold text-ink">{batch.batchNo}</div>
                  <div className="text-xs text-neutral-500">{batch.programType}</div>
                </div>
                <StatusBadge status={batch.status} />
                <div className="text-xs text-neutral-500">{batch.industry} &middot; {batch.setup}</div>
                <div className="text-xs text-neutral-500">
                  {batch.started} &ndash; {batch.projectedEnd}
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-600">
                  <ClipboardList size={13} className="text-neutral-400" /> {activities.length} activities completed
                </div>
                <div className="ml-auto flex gap-5 text-right">
                  <div>
                    <div className="text-[10px] text-neutral-400">Received</div>
                    <div className="text-xs font-semibold text-ink">{formatCurrency(fin.totalReceived)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400">Balance</div>
                    <div className={cn('text-xs font-semibold', fin.totalBalance > 0 ? 'text-warning-700' : 'text-ink')}>
                      {formatCurrency(fin.totalBalance)}
                    </div>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-neutral-100 p-4">
                  <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-md bg-neutral-50 p-3 text-xs sm:grid-cols-4">
                    <div>
                      <div className="text-[10px] text-neutral-400">Trainees</div>
                      <div className="font-semibold text-ink">{list.length}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400">Created</div>
                      <div className="font-semibold text-ink">{batch.createdDate}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400">Total received</div>
                      <div className="font-semibold text-success-700">{formatCurrency(fin.totalReceived)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400">Total balance</div>
                      <div className={cn('font-semibold', fin.totalBalance > 0 ? 'text-warning-700' : 'text-ink')}>
                        {formatCurrency(fin.totalBalance)}
                      </div>
                    </div>
                  </div>

                  {batch.dissolvedRemarks && (
                    <div className="mb-4 rounded-md border border-danger-100 bg-danger-50 px-3 py-2 text-xs text-danger-800">
                      {batch.dissolvedRemarks}
                    </div>
                  )}

                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <Wallet size={13} className="text-neutral-400" /> Completed activities
                  </div>
                  <div className="overflow-x-auto rounded-md border border-neutral-200 lss-scrollbar">
                    <table className="w-full min-w-[720px] border-collapse text-sm">
                      <thead>
                        <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                          <th className="px-3 py-2 font-medium">Task</th>
                          <th className="px-3 py-2 font-medium">Trainee</th>
                          <th className="px-3 py-2 font-medium">Trainer</th>
                          <th className="px-3 py-2 font-medium">Time goal</th>
                          <th className="px-3 py-2 font-medium">Time spent</th>
                          <th className="px-3 py-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((a) => (
                          <tr key={a.id} className="border-t border-neutral-100">
                            <td className="px-3 py-2 font-medium text-ink">{a.task}</td>
                            <td className="px-3 py-2 text-neutral-600">{a.trainee}</td>
                            <td className="px-3 py-2 text-neutral-600">{a.trainer}</td>
                            <td className="px-3 py-2 font-mono text-xs text-neutral-600">{a.timeGoal}h</td>
                            <td className="px-3 py-2 font-mono text-xs text-neutral-600">{a.timeSpent}h</td>
                            <td className="px-3 py-2 font-mono text-xs text-neutral-600">{a.date}</td>
                          </tr>
                        ))}
                        {activities.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-3 py-6 text-center text-xs text-neutral-400">
                              No completed activities recorded for this batch.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredBatches.length === 0 && (
          <div className="rounded-lg border border-neutral-200 bg-white px-4 py-10 text-center text-xs text-neutral-400">
            No batches match your search or filters.
          </div>
        )}
      </div>

      <BatchReportPrint batches={filteredBatches} traineesByBatch={traineesByBatch} generatedAt={printGeneratedAt} dateRangeLabel={dateRangeLabel} />
    </>
  )
}
