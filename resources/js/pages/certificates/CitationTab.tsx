import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Archive, ArchiveRestore, Trash2, Lock, X, FileText, Eye } from 'lucide-react'
import { Button } from '@/components/Button'
import { Dropdown } from '@/components/Dropdown'
import { RowMenu } from '@/components/RowMenu'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Modal } from '@/components/Modal'
import { useToast } from '@/components/Toast'
import { certificateCitations as initialCitations, seminarParticipants } from '@/data/mockData'
import { useBatches } from '@/context/BatchesContext'
import type { CertificateCitation } from '@/types'
import { cn } from '@/lib/utils'
import { AddEditCitationModal, type CitationFormValues } from './AddEditCitationModal'
import { renderCitation } from './certificateUtils'
import { CertificateSheet } from './CertificatePrint'

type PendingAction = { type: 'archive' | 'restore' | 'delete'; citation: CertificateCitation } | null

export function CitationTab({ currentUserName }: { currentUserName: string }) {
  const { showToast } = useToast()
  const { trainees } = useBatches()
  const [citations, setCitations] = useState<CertificateCitation[]>(initialCitations)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [appliesFilter, setAppliesFilter] = useState('All types')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CertificateCitation | null>(null)
  const [pending, setPending] = useState<PendingAction>(null)
  const [previewing, setPreviewing] = useState<CertificateCitation | null>(null)

  // How many certificates already reference each citation — drives the "in use" hint and delete guard.
  const usageCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const t of trainees) {
      if (t.certificate?.citationId) counts.set(t.certificate.citationId, (counts.get(t.certificate.citationId) ?? 0) + 1)
    }
    for (const p of seminarParticipants) {
      if (p.certificate?.citationId) counts.set(p.certificate.citationId, (counts.get(p.certificate.citationId) ?? 0) + 1)
    }
    return counts
  }, [trainees])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return citations
      .filter((c) => statusFilter === 'All statuses' || c.status === statusFilter.toLowerCase())
      .filter((c) => appliesFilter === 'All types' || c.appliesTo === appliesFilter)
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.bodyText.toLowerCase().includes(q) || (c.createdBy ?? '').toLowerCase().includes(q))
      .sort((a, b) => (a.updatedAt && b.updatedAt ? (a.updatedAt < b.updatedAt ? 1 : -1) : 0))
  }, [citations, query, statusFilter, appliesFilter])

  const activeCount = citations.filter((c) => c.status === 'active').length

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }
  function openEdit(c: CertificateCitation) {
    setEditing(c)
    setModalOpen(true)
  }

  function handleSave(values: CitationFormValues) {
    if (editing) {
      setCitations((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...values, updatedAt: new Date().toISOString() } : c)),
      )
      showToast(`"${values.title}" was updated.`, 'success')
    } else {
      const newCitation: CertificateCitation = {
        id: `cit-${Date.now()}`,
        ...values,
        status: 'active',
        createdBy: currentUserName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setCitations((prev) => [newCitation, ...prev])
      showToast(`"${values.title}" was added.`, 'success')
    }
    setModalOpen(false)
    setEditing(null)
  }

  function runConfirmed() {
    if (!pending) return
    const { type, citation } = pending
    if (type === 'archive') {
      setCitations((prev) => prev.map((c) => (c.id === citation.id ? { ...c, status: 'archived' } : c)))
      showToast(`"${citation.title}" was archived.`, 'success')
    } else if (type === 'restore') {
      setCitations((prev) => prev.map((c) => (c.id === citation.id ? { ...c, status: 'active' } : c)))
      showToast(`"${citation.title}" was restored.`, 'success')
    } else if (type === 'delete') {
      setCitations((prev) => prev.filter((c) => c.id !== citation.id))
      showToast(`"${citation.title}" was permanently deleted.`, 'error')
    }
    setPending(null)
  }

  const previewText = previewing
    ? renderCitation(previewing.bodyText, {
        name: 'Juan Dela Cruz',
        school: 'Sample School',
        program: 'College OJT',
        industry: 'Information Technology',
        hours: 486,
        dateStarted: 'April 14, 2026',
        dateCompleted: 'July 5, 2026',
        seminarTopic: 'Sample Seminar Topic',
        date: 'July 5, 2026',
      })
    : ''

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-neutral-500">
          {activeCount} active of {citations.length} citation{citations.length === 1 ? '' : 's'} · used when generating trainee and seminar certificates
        </span>
        <Button variant="primary" size="sm" icon={Plus} className="w-full sm:w-auto" onClick={openAdd}>
          Add citation
        </Button>
      </div>

      <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full flex-1 sm:min-w-[200px]">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search citations by title, text, or author..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="w-full sm:w-40">
          <Dropdown options={['All types', 'Trainee', 'Seminar', 'Both']} value={appliesFilter} onChange={setAppliesFilter} />
        </div>
        <div className="w-full sm:w-40">
          <Dropdown options={['All statuses', 'Active', 'Archived']} value={statusFilter} onChange={setStatusFilter} />
        </div>
        {(query || statusFilter !== 'All statuses' || appliesFilter !== 'All types') && (
          <button
            onClick={() => {
              setQuery('')
              setStatusFilter('All statuses')
              setAppliesFilter('All types')
            }}
            className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={13} /> Clear
          </button>
        )}
        <span className="text-xs text-neutral-400 sm:ml-auto">{filtered.length} of {citations.length}</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="divide-y divide-neutral-100">
          {filtered.map((c) => {
            const usage = usageCounts.get(c.id) ?? 0
            return (
              <div key={c.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn('text-sm font-semibold', c.status === 'archived' ? 'text-neutral-400' : 'text-ink')}>
                      {c.title}
                    </span>
                    <span className="inline-flex items-center rounded-pill bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                      {c.appliesTo}
                    </span>
                    {c.critical && (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-warning-50 px-1.5 py-0.5 text-[10px] font-medium text-warning-800">
                        <Lock size={9} /> Critical
                      </span>
                    )}
                    {c.status === 'archived' && (
                      <span className="inline-flex items-center rounded-pill bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                        Archived
                      </span>
                    )}
                    {usage > 0 && (
                      <span className="inline-flex items-center rounded-pill bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                        Used on {usage} certificate{usage === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <p className={cn('mt-1 line-clamp-2 max-w-2xl text-xs leading-relaxed', c.status === 'archived' ? 'text-neutral-400' : 'text-neutral-500')}>
                    {c.bodyText}
                  </p>
                  <p className="mt-1.5 text-[11px] text-neutral-400">
                    Added by {c.createdBy ?? 'Unknown'}
                    {c.createdAt && <> · {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>}
                    {c.updatedAt && c.updatedAt !== c.createdAt && (
                      <> · edited {new Date(c.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 self-start">
                  <button
                    onClick={() => setPreviewing(c)}
                    className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    <Eye size={13} /> Preview
                  </button>
                  <button
                    onClick={() => openEdit(c)}
                    className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                    aria-label="Edit citation"
                  >
                    <Pencil size={14} />
                  </button>
                  <RowMenu
                    actions={[
                      c.status === 'archived'
                        ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setPending({ type: 'restore', citation: c }) }
                        : { label: 'Archive', icon: Archive, onClick: () => setPending({ type: 'archive', citation: c }) },
                      {
                        label: c.critical ? 'Delete (protected)' : usage > 0 ? 'Delete (in use)' : 'Delete',
                        icon: c.critical ? Lock : Trash2,
                        danger: !c.critical && usage === 0,
                        disabled: c.critical || usage > 0,
                        onClick: () => setPending({ type: 'delete', citation: c }),
                      },
                    ]}
                  />
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-neutral-400">
              <FileText size={20} className="mx-auto mb-2 text-neutral-300" />
              No citations match your search or filters.
            </div>
          )}
        </div>
      </div>

      <AddEditCitationModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} onSave={handleSave} initial={editing} />

      {pending && (
        <ConfirmDialog
          open={!!pending}
          onClose={() => setPending(null)}
          onConfirm={runConfirmed}
          title={pending.type === 'archive' ? 'Archive citation' : pending.type === 'restore' ? 'Restore citation' : 'Delete citation'}
          tone={pending.type === 'delete' ? 'danger' : 'default'}
          confirmLabel={pending.type === 'archive' ? 'Archive' : pending.type === 'restore' ? 'Restore' : 'Delete permanently'}
          confirmDisabled={pending.type === 'delete' && (!!pending.citation.critical || (usageCounts.get(pending.citation.id) ?? 0) > 0)}
          description={
            pending.type === 'archive'
              ? `"${pending.citation.title}" will be moved to archived records and hidden when generating new certificates. You can restore it later.`
              : pending.type === 'restore'
                ? `"${pending.citation.title}" will be restored and made available again when generating new certificates.`
                : pending.citation.critical
                  ? `"${pending.citation.title}" is marked critical and can't be permanently deleted. Archive it instead to keep it out of new certificates while preserving history.`
                  : (usageCounts.get(pending.citation.id) ?? 0) > 0
                    ? `"${pending.citation.title}" is currently used on ${usageCounts.get(pending.citation.id)} issued certificate(s) and can't be permanently deleted. Archive it instead.`
                    : `This permanently deletes "${pending.citation.title}" and cannot be undone.`
          }
        />
      )}

      <Modal open={!!previewing} onClose={() => setPreviewing(null)} title="Citation preview" description="Preview with sample recipient details — actual certificates substitute the real trainee or participant data." maxWidth={640}>
        {previewing && (
          <div className="flex flex-col gap-4">
            <CertificateSheet
              doc={{
                key: 'preview',
                recipientName: 'Juan Dela Cruz',
                subtitle: previewing.appliesTo === 'Seminar' ? 'Sample Seminar Topic' : 'College OJT — Information Technology',
                citationText: previewText,
                certificateNo: 'PREVIEW-0000',
                issuedDate: undefined,
              }}
            />
            <div className="flex justify-end">
              <Button variant="secondary" icon={X} onClick={() => setPreviewing(null)}>Close preview</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
