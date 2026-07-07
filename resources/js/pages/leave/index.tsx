import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from '@/lib/router-compat'
import { Search, Eye, CheckCircle2, XCircle, Paperclip, CalendarOff, X } from 'lucide-react'
import { Dropdown } from '@/components/Dropdown'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TextAreaField } from '@/components/FormField'
import { TooltipIconButton } from '@/components/TooltipIconButton'
import { useToast } from '@/components/Toast'
import { useNotifications } from '@/context/NotificationsContext'
import { leaveRecords as initialLeaveRecords, currentUser, TODAY } from '@/data/mockData'
import { useBatches } from '@/context/BatchesContext'
import type { LeaveRecord, LeaveType } from '@/types'
import { cn, toDateInputValue } from '@/lib/utils'
import { LeaveDetailsModal, LEAVE_STATUS_LABEL, LEAVE_STATUS_STYLE } from '@/pages/leave/LeaveDetailsModal'

const STATUS_OPTIONS = ['All statuses', 'Pending', 'Approved', 'Declined']
const LEAVE_TYPE_OPTIONS: (LeaveType | 'All types')[] = ['All types', 'Sick Leave', 'Vacation Leave', 'School-Related Leave', 'Bereavement Leave']

interface Filters {
  batch: string
  status: string
  leaveType: string
  onDate: string // "on leave on this date" filter
  rangeFrom: string
  rangeTo: string
}
const EMPTY_FILTERS: Filters = { batch: 'All batches', status: 'All statuses', leaveType: 'All types', onDate: '', rangeFrom: '', rangeTo: '' }

type PendingDecision = { kind: 'approve' | 'decline'; record: LeaveRecord } | null

export default function LeavePage() {
  const { showToast } = useToast()
  const { notify, resolveForLeave } = useNotifications()
  const { batches } = useBatches()
  const [searchParams, setSearchParams] = useSearchParams()
  const batchOptions = useMemo(() => ['All batches', ...batches.map((b) => b.batchNo)], [batches])

  const [records, setRecords] = useState<LeaveRecord[]>(initialLeaveRecords)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [viewRecord, setViewRecord] = useState<LeaveRecord | null>(null)
  const [pendingDecision, setPendingDecision] = useState<PendingDecision>(null)
  const [decisionRemarks, setDecisionRemarks] = useState('')

  // Deep link from the notification bell: /leave?highlight=<id> opens that request's details.
  useEffect(() => {
    const highlightId = searchParams.get('highlight')
    if (!highlightId) return
    const record = records.find((r) => r.id === highlightId)
    if (record) setViewRecord(record)
    const next = new URLSearchParams(searchParams)
    next.delete('highlight')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = records.filter((r) => {
      if (q && !r.traineeName.toLowerCase().includes(q)) return false
      if (filters.batch !== 'All batches' && r.batchNo !== filters.batch) return false
      if (filters.status !== 'All statuses' && r.status !== filters.status.toLowerCase()) return false
      if (filters.leaveType !== 'All types' && r.leaveType !== filters.leaveType) return false
      if (filters.onDate && !(r.leaveDate <= filters.onDate && filters.onDate <= r.returnDate)) return false
      if (filters.rangeFrom && r.leaveDate < filters.rangeFrom) return false
      if (filters.rangeTo && r.leaveDate > filters.rangeTo) return false
      return true
    })

    // Pending always on top; within each group, most recently submitted first.
    const byDateSubmittedDesc = (a: LeaveRecord, b: LeaveRecord) => (a.dateSubmitted < b.dateSubmitted ? 1 : -1)
    const pending = filtered.filter((r) => r.status === 'pending').sort(byDateSubmittedDesc)
    const rest = filtered.filter((r) => r.status !== 'pending').sort(byDateSubmittedDesc)
    return [...pending, ...rest]
  }, [records, query, filters])

  const hasActiveFilters = query !== '' || Object.entries(filters).some(([k, v]) => v !== EMPTY_FILTERS[k as keyof Filters])
  const clearFilters = () => {
    setQuery('')
    setFilters(EMPTY_FILTERS)
  }

  function requestDecision(kind: 'approve' | 'decline', record: LeaveRecord) {
    setViewRecord(null)
    setDecisionRemarks('')
    setPendingDecision({ kind, record })
  }

  function confirmDecision() {
    if (!pendingDecision) return
    const { kind, record } = pendingDecision
    const status: LeaveRecord['status'] = kind === 'approve' ? 'approved' : 'declined'
    const remarks = decisionRemarks.trim()
    const decisionDate = toDateInputValue(TODAY)

    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, status, decisionRemarks: remarks || undefined, decidedBy: currentUser.name, decisionDate }
          : r,
      ),
    )

    // Clears the pending admin notification for this request, and records the
    // outcome as a trainee-facing notification (no trainee UI exists to render
    // it in yet, but the data flow is real and inspectable).
    resolveForLeave(record.id)
    notify({
      audience: 'trainee',
      title: kind === 'approve' ? 'Leave request approved' : 'Leave request declined',
      body:
        kind === 'approve'
          ? `Your ${record.leaveType} request (${record.leaveDate} to ${record.returnDate}) was approved.`
          : `Your ${record.leaveType} request was declined. Reason: ${remarks || 'No reason provided.'}`,
      createdAt: decisionDate,
      relatedLeaveId: record.id,
    })

    showToast(
      `${record.traineeName}\u2019s leave request was ${status}. Trainee notified.`,
      kind === 'approve' ? 'success' : 'error',
    )
    setPendingDecision(null)
    setDecisionRemarks('')
  }

  const pendingCount = records.filter((r) => r.status === 'pending').length

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Leave management</h1>
          <p className="text-sm text-neutral-500">{pendingCount} pending of {records.length} leave requests</p>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="relative min-w-[200px] flex-1">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Search trainee</label>
            <Search size={14} className="pointer-events-none absolute left-2.5 top-[34px] text-neutral-400" />
            <input
              type="text"
              placeholder="Search by trainee name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Batch</label>
            <Dropdown options={batchOptions} value={filters.batch} onChange={(v) => setFilters((f) => ({ ...f, batch: v }))} />
          </div>
          <div className="w-full sm:w-36">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Status</label>
            <Dropdown options={STATUS_OPTIONS} value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} />
          </div>
          <div className="w-full sm:w-48">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Leave type</label>
            <Dropdown options={LEAVE_TYPE_OPTIONS} value={filters.leaveType} onChange={(v) => setFilters((f) => ({ ...f, leaveType: v }))} />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">On leave on</label>
            <input
              type="date"
              value={filters.onDate}
              onChange={(e) => setFilters((f) => ({ ...f, onDate: e.target.value }))}
              className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Leave date from</label>
            <input
              type="date"
              value={filters.rangeFrom}
              onChange={(e) => setFilters((f) => ({ ...f, rangeFrom: e.target.value }))}
              className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Leave date to</label>
            <input
              type="date"
              value={filters.rangeTo}
              onChange={(e) => setFilters((f) => ({ ...f, rangeTo: e.target.value }))}
              className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" icon={X} onClick={clearFilters} className="ml-auto">
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-neutral-400">{filteredSorted.length} of {records.length} requests</span>
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block">
        <div className="overflow-x-auto lss-scrollbar">
          <table className="w-full min-w-[1080px] border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                <th className="px-4 py-2.5 font-medium">Trainee</th>
                <th className="px-4 py-2.5 font-medium">Batch</th>
                <th className="px-4 py-2.5 font-medium">Leave date</th>
                <th className="px-4 py-2.5 font-medium">Return date</th>
                <th className="px-4 py-2.5 font-medium">Leave type</th>
                <th className="px-4 py-2.5 font-medium">Remarks</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Date submitted</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((r) => (
                <tr key={r.id} className="border-t border-neutral-100 transition-colors hover:bg-neutral-50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-600">
                        {r.initials}
                      </span>
                      <span className="font-medium text-ink">{r.traineeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-600">{r.batchNo}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-600">{r.leaveDate}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-600">{r.returnDate}</td>
                  <td className="px-4 py-2.5 text-neutral-600">{r.leaveType}</td>
                  <td className="px-4 py-2.5 max-w-[200px] truncate text-xs text-neutral-500" title={r.remarks}>
                    <span className="inline-flex items-center gap-1">
                      {r.supportingDocuments && r.supportingDocuments.length > 0 && <Paperclip size={11} className="shrink-0 text-neutral-400" />}
                      {r.remarks}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', LEAVE_STATUS_STYLE[r.status])}>
                      {LEAVE_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-600">{r.dateSubmitted}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-0.5">
                      <TooltipIconButton icon={Eye} label="View details" onClick={() => setViewRecord(r)} />
                      <TooltipIconButton
                        icon={CheckCircle2}
                        label="Approve"
                        disabled={r.status !== 'pending'}
                        onClick={() => requestDecision('approve', r)}
                      />
                      <TooltipIconButton
                        icon={XCircle}
                        label="Decline"
                        disabled={r.status !== 'pending'}
                        onClick={() => requestDecision('decline', r)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSorted.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-neutral-400">
                    <CalendarOff size={20} className="mx-auto mb-2 text-neutral-300" />
                    No leave requests match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 sm:hidden">
        {filteredSorted.map((r) => (
          <div key={r.id} className="rounded-lg border border-neutral-200 bg-white p-3.5">
            <button onClick={() => setViewRecord(r)} className="flex w-full items-start justify-between gap-2 text-left">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-600">
                  {r.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{r.traineeName}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {r.batchNo} · {r.leaveType}
                  </p>
                </div>
              </div>
              <span className={cn('shrink-0 rounded-pill px-2 py-0.5 text-[11px] font-medium', LEAVE_STATUS_STYLE[r.status])}>
                {LEAVE_STATUS_LABEL[r.status]}
              </span>
            </button>
            <p className="mt-2 text-xs text-neutral-500">
              {r.leaveDate} – {r.returnDate}
            </p>
            {r.remarks && (
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-neutral-400">
                {r.supportingDocuments && r.supportingDocuments.length > 0 && <Paperclip size={11} className="shrink-0" />}
                {r.remarks}
              </p>
            )}
            {r.status === 'pending' && (
              <div className="mt-2.5 flex gap-2 border-t border-neutral-100 pt-2.5">
                <Button variant="secondary" size="sm" icon={CheckCircle2} className="flex-1" onClick={() => requestDecision('approve', r)}>
                  Approve
                </Button>
                <Button variant="secondary" size="sm" icon={XCircle} className="flex-1" onClick={() => requestDecision('decline', r)}>
                  Decline
                </Button>
              </div>
            )}
          </div>
        ))}
        {filteredSorted.length === 0 && (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400">
            <CalendarOff size={20} className="mx-auto mb-2 text-neutral-300" />
            No leave requests match your search or filters.
          </div>
        )}
      </div>

      <LeaveDetailsModal
        record={viewRecord}
        onClose={() => setViewRecord(null)}
        onRequestApprove={(r) => requestDecision('approve', r)}
        onRequestDecline={(r) => requestDecision('decline', r)}
      />

      <ConfirmDialog
        open={!!pendingDecision}
        onClose={() => setPendingDecision(null)}
        onConfirm={confirmDecision}
        title={pendingDecision?.kind === 'approve' ? 'Approve leave request' : 'Decline leave request'}
        tone={pendingDecision?.kind === 'decline' ? 'danger' : 'default'}
        confirmLabel={pendingDecision?.kind === 'approve' ? 'Approve' : 'Decline'}
        confirmDisabled={pendingDecision?.kind === 'decline' && !decisionRemarks.trim()}
        description={
          pendingDecision ? (
            <>
              {pendingDecision.kind === 'approve' ? 'Approve' : 'Decline'} the {pendingDecision.record.leaveType.toLowerCase()} request from{' '}
              <span className="font-medium text-ink">{pendingDecision.record.traineeName}</span> ({pendingDecision.record.leaveDate} to{' '}
              {pendingDecision.record.returnDate})? The trainee will be notified{pendingDecision.kind === 'decline' ? ' with your remarks below' : ''}.
            </>
          ) : (
            ''
          )
        }
      >
        <TextAreaField
          label="Remarks"
          optional={pendingDecision?.kind === 'approve'}
          placeholder={pendingDecision?.kind === 'approve' ? 'Optional note for this approval...' : 'Reason for declining this request...'}
          value={decisionRemarks}
          onChange={(e) => setDecisionRemarks(e.target.value)}
        />
      </ConfirmDialog>
    </div>
  )
}
