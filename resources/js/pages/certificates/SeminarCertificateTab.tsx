import { useMemo, useState } from 'react'
import { Search, Printer, Eye, X, Award, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/Button'
import { Dropdown } from '@/components/Dropdown'
import { Modal } from '@/components/Modal'
import { TooltipIconButton } from '@/components/TooltipIconButton'
import { seminars, seminarParticipants, certificateCitations } from '@/data/mockData'
import type { SeminarParticipant } from '@/types'
import { cn } from '@/lib/utils'
import { CertificateSheet, CertificateBatchPrint, type CertificateDoc } from './CertificatePrint'
import { renderCitation, tokensForSeminarParticipant } from './certificateUtils'

function certStatus(p: SeminarParticipant): 'Issued' | 'Not issued' | 'Not eligible' {
  if (p.certificate?.issued) return 'Issued'
  if (p.status === 'Feedback Completed' || p.status === 'Completed' || p.status === 'Certificate Sent') return 'Not issued'
  return 'Not eligible'
}

const STATUS_STYLE: Record<string, string> = {
  Issued: 'bg-success-50 text-success-800',
  'Not issued': 'bg-warning-50 text-warning-800',
  'Not eligible': 'bg-neutral-100 text-neutral-500',
}

function buildDoc(p: SeminarParticipant): CertificateDoc {
  const seminar = seminars.find((s) => s.topic === p.seminarTopic)
  const citation = certificateCitations.find((c) => c.id === p.certificate?.citationId)
  const citationText = citation
    ? renderCitation(citation.bodyText, tokensForSeminarParticipant(p, seminar))
    : `This is to certify that ${p.name} has attended "${p.seminarTopic}".`
  return {
    key: p.id,
    recipientName: p.name,
    subtitle: p.seminarTopic,
    citationText,
    certificateNo: p.certificate?.certificateNo ?? '—',
    issuedDate: p.certificate?.issuedDate,
  }
}

export function SeminarCertificateTab() {
  const [query, setQuery] = useState('')
  const [topicFilter, setTopicFilter] = useState('All seminars')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [previewParticipant, setPreviewParticipant] = useState<SeminarParticipant | null>(null)
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false)
  const [printQueue, setPrintQueue] = useState<SeminarParticipant[]>([])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return seminarParticipants
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.certificate?.certificateNo ?? '').toLowerCase().includes(q))
      .filter((p) => topicFilter === 'All seminars' || p.seminarTopic === topicFilter)
      .filter((p) => statusFilter === 'All statuses' || certStatus(p) === statusFilter)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [query, topicFilter, statusFilter])

  const allVisibleSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id))

  function toggleAll() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev)
        filtered.forEach((p) => next.delete(p.id))
        return next
      }
      const next = new Set(prev)
      filtered.forEach((p) => next.add(p.id))
      return next
    })
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const printGeneratedAt = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
  const selectedParticipants = seminarParticipants.filter((p) => selected.has(p.id) && p.certificate?.issued)
  const printableSelectedCount = selectedParticipants.length

  function handlePrintSelected() {
    setPrintQueue(selectedParticipants)
    setBulkPreviewOpen(true)
  }
  function triggerPrint() {
    window.print()
  }

  const previewDoc = previewParticipant ? buildDoc(previewParticipant) : null
  const bulkDocs = printQueue.map(buildDoc)

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between no-print">
        <span className="text-xs text-neutral-500">
          {filtered.length} of {seminarParticipants.length} participant records
          {selected.size > 0 && <> · {selected.size} selected</>}
        </span>
        <Button
          variant="primary"
          size="sm"
          icon={Printer}
          className="w-full sm:w-auto"
          disabled={printableSelectedCount === 0}
          onClick={handlePrintSelected}
        >
          Print selected ({printableSelectedCount})
        </Button>
      </div>

      <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 no-print sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full flex-1 sm:min-w-[200px]">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or certificate no..."
            className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="w-full sm:w-56">
          <Dropdown options={['All seminars', ...seminars.map((s) => s.topic)]} value={topicFilter} onChange={setTopicFilter} />
        </div>
        <div className="w-full sm:w-40">
          <Dropdown options={['All statuses', 'Issued', 'Not issued', 'Not eligible']} value={statusFilter} onChange={setStatusFilter} />
        </div>
        {(query || topicFilter !== 'All seminars' || statusFilter !== 'All statuses') && (
          <button
            onClick={() => {
              setQuery('')
              setTopicFilter('All seminars')
              setStatusFilter('All statuses')
            }}
            className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white no-print">
        <div className="overflow-x-auto lss-scrollbar">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                <th className="w-10 px-4 py-2.5">
                  <button onClick={toggleAll} aria-label="Select all" className="flex items-center text-neutral-400 hover:text-brand-600">
                    {allVisibleSelected ? <CheckSquare size={16} className="text-brand-600" /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium">Participant</th>
                <th className="px-4 py-2.5 font-medium">Seminar topic</th>
                <th className="px-4 py-2.5 font-medium">Certificate no.</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Issued date</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const status = certStatus(p)
                return (
                  <tr key={p.id} className="border-t border-neutral-100 transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-2.5">
                      <button onClick={() => toggleOne(p.id)} aria-label={`Select ${p.name}`} className="flex items-center text-neutral-400 hover:text-brand-600">
                        {selected.has(p.id) ? <CheckSquare size={16} className="text-brand-600" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-ink">{p.name}</div>
                      <div className="text-xs text-neutral-500">{p.email}</div>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{p.seminarTopic}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600">{p.certificate?.certificateNo ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[status])}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600">{p.certificate?.issuedDate ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-0.5">
                        <TooltipIconButton icon={Eye} label="Preview & print" onClick={() => setPreviewParticipant(p)} disabled={!p.certificate?.issued} />
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-neutral-400">
                    <Award size={20} className="mx-auto mb-2 text-neutral-300" />
                    No certificate records match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single certificate preview & print */}
      <Modal open={!!previewParticipant} onClose={() => setPreviewParticipant(null)} title="Certificate preview" maxWidth={680}>
        {previewParticipant && previewDoc && (
          <div className="flex flex-col gap-4">
            <CertificateSheet doc={previewDoc} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" icon={X} onClick={() => setPreviewParticipant(null)}>Close</Button>
              <Button variant="primary" icon={Printer} onClick={() => { setPrintQueue([previewParticipant]); setTimeout(triggerPrint, 50) }}>
                Print
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk certificate preview & print */}
      <Modal open={bulkPreviewOpen} onClose={() => setBulkPreviewOpen(false)} title={`Print preview — ${printQueue.length} certificate${printQueue.length === 1 ? '' : 's'}`} maxWidth={680}>
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto lss-scrollbar pr-1">
          {bulkDocs.map((doc) => (
            <CertificateSheet key={doc.key} doc={doc} />
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" icon={X} onClick={() => setBulkPreviewOpen(false)}>Close</Button>
          <Button variant="primary" icon={Printer} onClick={triggerPrint}>Print all</Button>
        </div>
      </Modal>

      {printQueue.length > 0 && <CertificateBatchPrint docs={printQueue.map(buildDoc)} />}
      <p className="mt-2 text-[11px] text-neutral-400 no-print">Generated {printGeneratedAt}</p>
    </div>
  )
}
