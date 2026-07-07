import { useMemo, useState } from 'react'
import { Plus, Search, Archive, ArchiveRestore, Pencil, Trash2, Lock } from 'lucide-react'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TextAreaField, SelectField } from '@/components/FormField'
import { useToast } from '@/components/Toast'
import { behavioralQuestions as initialQuestions, behavioralRatingRecords } from '@/data/mockData'
import type { BehavioralQuestion, BehavioralSection } from '@/types'
import { cn } from '@/lib/utils'

type Filter = 'active' | 'archived' | 'all'

const SECTIONS: BehavioralSection[] = [
  'I. Work Performance & Discipline',
  'II. Learning Ability & Technical Growth',
  'III. Teamwork & Professional Behavior',
  'IV. Technical Competency & Job Readiness',
  "V. Trainer's General Evaluation of the Trainee",
  'VI. Written Feedback',
]

const TYPE_LABEL: Record<BehavioralQuestion['type'], string> = {
  rating: 'Rated 1–5',
  text: 'Written response',
}

export function BehavioralAssessmentSetup() {
  const { showToast } = useToast()
  const [questions, setQuestions] = useState<BehavioralQuestion[]>(initialQuestions)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('active')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BehavioralQuestion | null>(null)
  const [draftText, setDraftText] = useState('')
  const [draftSection, setDraftSection] = useState<BehavioralSection>(SECTIONS[0])
  const [draftType, setDraftType] = useState<BehavioralQuestion['type']>('rating')

  const [archiveTarget, setArchiveTarget] = useState<BehavioralQuestion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BehavioralQuestion | null>(null)

  /** A question is "in use" once it has been answered in a submitted evaluation — critical records like this stay archive-only. */
  const questionInUse = useMemo(() => {
    const used = new Set<string>()
    behavioralRatingRecords.forEach((r) => r.answers.forEach((a) => used.add(a.questionId)))
    return used
  }, [])

  const filtered = questions
    .filter((q) => (filter === 'all' ? true : q.status === filter))
    .filter((q) => q.question.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.order - b.order)

  const grouped = useMemo(() => {
    const map = new Map<BehavioralSection, BehavioralQuestion[]>()
    SECTIONS.forEach((s) => map.set(s, []))
    filtered.forEach((q) => {
      if (!map.has(q.section)) map.set(q.section, [])
      map.get(q.section)!.push(q)
    })
    return Array.from(map.entries()).filter(([, qs]) => qs.length > 0)
  }, [filtered])

  const activeCount = questions.filter((q) => q.status === 'active').length
  const archivedCount = questions.filter((q) => q.status === 'archived').length

  function openAdd() {
    setEditing(null)
    setDraftText('')
    setDraftSection(SECTIONS[0])
    setDraftType('rating')
    setFormOpen(true)
  }

  function openEdit(q: BehavioralQuestion) {
    setEditing(q)
    setDraftText(q.question)
    setDraftSection(q.section)
    setDraftType(q.type)
    setFormOpen(true)
  }

  function saveQuestion() {
    const text = draftText.trim()
    if (!text) {
      showToast('Enter the question text before saving.', 'error')
      return
    }
    if (editing) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === editing.id ? { ...q, question: text, section: draftSection, type: draftType } : q)),
      )
      showToast('Question updated.', 'success')
    } else {
      const nextOrder = questions.length ? Math.max(...questions.map((q) => q.order)) + 1 : 1
      const created: BehavioralQuestion = {
        id: `bq-${Date.now()}`,
        question: text,
        section: draftSection,
        type: draftType,
        order: nextOrder,
        status: 'active',
      }
      setQuestions((prev) => [...prev, created])
      showToast('Question added.', 'success')
    }
    setFormOpen(false)
  }

  function confirmArchive() {
    if (!archiveTarget) return
    const willArchive = archiveTarget.status === 'active'
    setQuestions((prev) =>
      prev.map((q) => (q.id === archiveTarget.id ? { ...q, status: willArchive ? 'archived' : 'active' } : q)),
    )
    showToast(willArchive ? 'Question archived.' : 'Question restored.', 'success')
    setArchiveTarget(null)
  }

  function restoreDirect(q: BehavioralQuestion) {
    setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: 'active' } : x)))
    showToast('Question restored.', 'success')
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id))
    showToast('Question permanently deleted.', 'success')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">
          Manage the Trainer Evaluation for Trainees questionnaire — organized into sections, with rated statements and
          written-feedback items.
        </p>
        <Button variant="primary" icon={Plus} onClick={openAdd}>
          Add question
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3">
        <div className="relative w-full max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-0.5">
          {([
            ['active', `Active (${activeCount})`],
            ['archived', `Archived (${archivedCount})`],
            ['all', 'All'],
          ] as [Filter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                filter === key ? 'bg-white text-ink shadow-card' : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {grouped.map(([section, qs]) => (
          <div key={section} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-600">
              {section}
            </div>
            <div className="divide-y divide-neutral-100">
              {qs.map((q, i) => {
                const inUse = questionInUse.has(q.id)
                return (
                  <div key={q.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 shrink-0 font-mono text-xs text-neutral-400">{i + 1}.</span>
                      <div className="min-w-0">
                        <span className={cn('text-sm', q.status === 'archived' ? 'text-neutral-400' : 'text-ink')}>
                          {q.question}
                        </span>
                        <span
                          className={cn(
                            'ml-2 inline-flex items-center rounded-pill px-2 py-0.5 text-[11px] font-medium',
                            q.type === 'rating' ? 'bg-brand-50 text-brand-600' : 'bg-neutral-100 text-neutral-500',
                          )}
                        >
                          {TYPE_LABEL[q.type]}
                        </span>
                        {q.status === 'archived' && (
                          <span className="ml-2 inline-flex items-center rounded-pill bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                            Archived
                          </span>
                        )}
                        {inUse && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-neutral-400">
                            <Lock size={11} /> Used in submitted evaluations
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => openEdit(q)}
                        aria-label="Edit question"
                        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      {q.status === 'active' ? (
                        <button
                          onClick={() => setArchiveTarget(q)}
                          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                        >
                          <Archive size={13} /> Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => restoreDirect(q)}
                          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
                        >
                          <ArchiveRestore size={13} /> Restore
                        </button>
                      )}
                      <button
                        onClick={() => !inUse && setDeleteTarget(q)}
                        disabled={inUse}
                        title={inUse ? 'Cannot delete — used in submitted evaluations. Archive instead.' : 'Delete permanently'}
                        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-danger-600 transition-colors hover:bg-danger-50 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="rounded-lg border border-neutral-200 bg-white px-4 py-10 text-center text-xs text-neutral-400">
            {query ? 'No questions match your search.' : 'No questions in this view yet.'}
          </div>
        )}
      </div>

      {/* Add / edit question */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit question' : 'Add question'} maxWidth={460}>
        <SelectField
          label="Section"
          options={SECTIONS}
          value={draftSection}
          onChange={(e) => setDraftSection(e.target.value as BehavioralSection)}
        />
        <SelectField
          label="Response type"
          options={['Rated 1–5', 'Written response']}
          value={TYPE_LABEL[draftType]}
          onChange={(e) => setDraftType(e.target.value === 'Rated 1–5' ? 'rating' : 'text')}
        />
        <TextAreaField
          label="Question"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="e.g. The trainee follows workplace policies, procedures, and instructions."
          rows={3}
        />
        <p className="-mt-2 mb-4 text-xs text-neutral-400">
          {draftType === 'rating'
            ? "Rated on the standard 1–5 scale during the trainee's evaluation."
            : "Collected as a written response during the trainee's evaluation."}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setFormOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" onClick={saveQuestion}>
            {editing ? 'Save changes' : 'Add question'}
          </Button>
        </div>
      </Modal>

      {/* Archive / restore confirm */}
      <ConfirmDialog
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={confirmArchive}
        title={archiveTarget?.status === 'active' ? 'Archive question?' : 'Restore question?'}
        description={
          archiveTarget?.status === 'active'
            ? 'This question will be hidden from new evaluations but kept for historical records. You can restore it anytime.'
            : 'This question will become available again in new behavioral evaluations.'
        }
        confirmLabel={archiveTarget?.status === 'active' ? 'Archive' : 'Restore'}
      />

      {/* Permanent delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete question permanently?"
        description="This cannot be undone. Since this question hasn't been used in any submitted evaluation, it can be safely deleted. If you may need it again, archive it instead."
        confirmLabel="Delete permanently"
        tone="danger"
      />
    </div>
  )
}
