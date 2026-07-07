import { useMemo, useState } from 'react'
import { useNavigate, useParams } from '@/lib/router-compat'
import {
  ArrowLeft,
  Pencil,
  CircleCheck,
  Trash2,
  Copy,
  Check,
  Ban,
  Search,
  Archive,
  Hash,
  Users,
  Briefcase,
  GraduationCap,
  Link2,
} from 'lucide-react'
import { Button } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TextAreaField } from '@/components/FormField'
import { useBatches } from '@/context/BatchesContext'
import { useToast } from '@/components/Toast'
import { TraineeRowMenu } from './TraineeRowMenu'
import { EditBatchModal } from './EditBatchModal'
import { TransferTraineeModal } from './TransferTraineeModal'
import { TerminateTraineeModal } from './TerminateTraineeModal'
import type { Trainee } from '@/types'
import { cn } from '@/lib/utils'

const TABS = ['Trainees', 'Activity log', 'Financials'] as const

export default function BatchDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getBatch, getTraineesForBatch, completeBatch, dissolveBatch, deleteBatch, restoreTrainee, archiveTrainee } =
    useBatches()
  const { showToast } = useToast()

  const batch = getBatch(id ?? '')

  const [tab, setTab] = useState<(typeof TABS)[number]>('Trainees')
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [dissolveOpen, setDissolveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [dissolveRemarks, setDissolveRemarks] = useState('')

  const [transferTarget, setTransferTarget] = useState<Trainee | null>(null)
  const [terminateTarget, setTerminateTarget] = useState<Trainee | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Trainee | null>(null)

  const allTrainees = useMemo(() => (batch ? getTraineesForBatch(batch.batchNo) : []), [batch, getTraineesForBatch])

  const visibleTrainees = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allTrainees
      .filter((t) => (showArchived ? true : !t.archived))
      .filter((t) => {
        if (!q) return true
        return [t.name, t.school, t.email].join(' ').toLowerCase().includes(q)
      })
      .sort((a, b) => {
        // Terminated trainees sink to the bottom; archived (when shown) sink lowest of all.
        const rank = (t: Trainee) => (t.archived ? 2 : t.status === 'terminated' ? 1 : 0)
        return rank(a) - rank(b)
      })
  }, [allTrainees, query, showArchived])

  const archivedCount = allTrainees.filter((t) => t.archived).length

  if (!batch) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-10 text-center">
        <p className="mb-3 text-sm text-neutral-500">This batch could not be found. It may have been deleted.</p>
        <Button variant="secondary" onClick={() => navigate('/batches')}>
          Back to batches
        </Button>
      </div>
    )
  }

  function handleCopyLink() {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(batch!.registrationLink).then(() => {
        setLinkCopied(true)
        showToast('Registration link copied to clipboard.', 'success')
        setTimeout(() => setLinkCopied(false), 1800)
      })
    } else {
      showToast('Could not copy automatically — please copy the link manually.', 'error')
    }
  }

  function handleComplete() {
    completeBatch(batch!.id)
    showToast(`${batch!.batchNo} marked as completed.`, 'success')
    setCompleteOpen(false)
  }

  function handleDissolve() {
    dissolveBatch(batch!.id, dissolveRemarks.trim() || 'Batch dissolved by admin.')
    showToast(`${batch!.batchNo} has been dissolved.`, 'info')
    setDissolveOpen(false)
    setDissolveRemarks('')
  }

  function handleDelete() {
    showToast(`${batch!.batchNo} was deleted.`, 'success')
    deleteBatch(batch!.id)
    setDeleteOpen(false)
    navigate('/batches')
  }

  function handleArchiveConfirm() {
    if (archiveTarget) {
      archiveTrainee(archiveTarget.id)
      showToast(`${archiveTarget.name} archived. They no longer appear in the active list.`, 'info')
      setArchiveTarget(null)
    }
  }

  return (
    <div>
      <button
        onClick={() => navigate('/batches')}
        className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500 transition-opacity hover:opacity-60"
      >
        <ArrowLeft size={14} />
        Back to batches
      </button>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-lg font-semibold text-ink">{batch.batchNo}</span>
            <StatusBadge status={batch.status} />
          </div>
          <p className="text-xs text-neutral-500">
            {batch.programType} · {batch.industry} · {batch.setup === 'F2F' ? 'Face-to-face' : 'Online'} · Created{' '}
            {batch.createdDate}
          </p>
          {batch.status === 'dissolved' && batch.dissolvedRemarks && (
            <p className="mt-1 text-xs text-danger-600">Dissolved: {batch.dissolvedRemarks}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={CircleCheck}
            onClick={() => setCompleteOpen(true)}
            disabled={batch.status === 'completed' || batch.status === 'dissolved'}
          >
            Complete
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Ban}
            onClick={() => setDissolveOpen(true)}
            disabled={batch.status === 'dissolved' || batch.status === 'completed'}
          >
            Dissolve
          </Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Batch detail summary */}
      <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <Hash size={13} /> Batch number
          </div>
          <div className="font-mono text-sm font-semibold text-ink">{batch.batchNo}</div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <Users size={13} /> Trainees
          </div>
          <div className="text-2xl font-semibold text-ink">{batch.trainees}</div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <Briefcase size={13} /> Industry
          </div>
          <div className="text-sm font-medium text-ink">{batch.industry}</div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <GraduationCap size={13} /> Program type
          </div>
          <div className="text-sm font-medium text-ink">{batch.programType}</div>
        </div>
      </div>

      {/* Registration link */}
      <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-3.5">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
          <Link2 size={13} /> Registration link
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 truncate rounded-md bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-600">
            {batch.registrationLink}
          </code>
          <Button variant="secondary" size="sm" icon={linkCopied ? Check : Copy} onClick={handleCopyLink} className="shrink-0">
            {linkCopied ? 'Copied' : 'Copy link'}
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-neutral-400">
          Trainees who open this link land on the registration form and are automatically associated with this batch.
        </p>
      </div>

      <div className="mb-3 flex gap-5 border-b border-neutral-200 pl-0.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'pb-2.5 text-xs font-medium transition-colors',
              tab === t ? 'border-b-2 border-brand-500 text-ink' : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Trainees' && (
        <>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trainee name, school, or email..."
                className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <button
              onClick={() => setShowArchived((v) => !v)}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                showArchived
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
              )}
            >
              <Archive size={13} />
              {showArchived ? 'Hide archived' : `Show archived (${archivedCount})`}
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="overflow-x-auto lss-scrollbar">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                    <th className="px-4 py-2.5 font-medium">Trainee</th>
                    <th className="px-4 py-2.5 font-medium">School</th>
                    <th className="px-4 py-2.5 font-medium">Required hrs</th>
                    <th className="px-4 py-2.5 font-medium">Progress</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {visibleTrainees.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/trainees/${t.id}`)}
                      className={cn(
                        'cursor-pointer border-t border-neutral-100 transition-colors hover:bg-neutral-50',
                        t.archived && 'opacity-60',
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-semibold text-brand-700">
                            {t.initials}
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate font-medium text-ink">{t.name}</span>
                            {t.status === 'terminated' && t.terminationRemarks && (
                              <span className="block truncate text-[11px] text-danger-600">
                                Terminated — {t.terminationRemarks}
                              </span>
                            )}
                            {t.archived && <span className="block text-[11px] text-neutral-400">Archived</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-600">{t.school}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{t.requiredHrs} hrs</td>
                      <td className="px-4 py-2.5 text-xs text-neutral-500">
                        {t.completedHrs} / {t.requiredHrs}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={t.archived ? 'archived' : t.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        <TraineeRowMenu
                          trainee={t}
                          onView={() => navigate(`/trainees/${t.id}`)}
                          onTransfer={() => setTransferTarget(t)}
                          onTerminate={() => setTerminateTarget(t)}
                          onArchive={() => setArchiveTarget(t)}
                          onRestore={() => {
                            restoreTrainee(t.id)
                            showToast(`${t.name} restored to the active list.`, 'success')
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  {visibleTrainees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-500">
                        {allTrainees.length === 0
                          ? 'No trainees have been assigned to this batch yet.'
                          : 'No trainees match your search.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'Activity log' && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
          Activity log entries will appear here.
        </div>
      )}
      {tab === 'Financials' && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
          Financial records for this batch will appear here.
        </div>
      )}

      <EditBatchModal open={editOpen} onClose={() => setEditOpen(false)} batch={batch} />

      <ConfirmDialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onConfirm={handleComplete}
        title="Complete batch"
        description={
          <>
            Mark <span className="font-medium text-ink">{batch.batchNo}</span> as completed? Trainees will no longer be
            editable as active participants.
          </>
        }
        confirmLabel="Mark as completed"
      />

      <ConfirmDialog
        open={dissolveOpen}
        onClose={() => {
          setDissolveOpen(false)
          setDissolveRemarks('')
        }}
        onConfirm={handleDissolve}
        title="Dissolve batch"
        tone="danger"
        description={
          <>
            Dissolve <span className="font-medium text-ink">{batch.batchNo}</span>? Trainees will remain visible with a
            dissolved remark on their records.
          </>
        }
        confirmLabel="Dissolve batch"
      >
        <TextAreaField
          label="Remarks"
          optional
          placeholder="Reason for dissolving this batch..."
          value={dissolveRemarks}
          onChange={(e) => setDissolveRemarks(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete batch"
        tone="danger"
        description={
          <>
            Delete <span className="font-medium text-ink">{batch.batchNo}</span> permanently? This will also remove all{' '}
            {allTrainees.length} associated trainee record{allTrainees.length === 1 ? '' : 's'} from this batch. This
            cannot be undone.
          </>
        }
        confirmLabel="Delete permanently"
      />

      <TransferTraineeModal open={!!transferTarget} onClose={() => setTransferTarget(null)} trainee={transferTarget} />
      <TerminateTraineeModal open={!!terminateTarget} onClose={() => setTerminateTarget(null)} trainee={terminateTarget} />

      <ConfirmDialog
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchiveConfirm}
        title="Archive trainee"
        description={
          <>
            Archive <span className="font-medium text-ink">{archiveTarget?.name}</span>? They will no longer appear in
            the active trainee list by default, but can be restored anytime.
          </>
        }
        confirmLabel="Archive trainee"
      />
    </div>
  )
}
